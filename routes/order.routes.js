const express = require('express');
const orderRouter = express.Router()
const bcrypt = require('bcrypt');
const Item = require('..//models/item.schema');
const User = require('..//models/user.schema');
const Order = require('..//models/order.schema')
const WishlistItem = require('../models/whishlist.schema')
const {verifyToken} = require('../utils/token')
const {isAdmin} = require('../utils/commonUtils')
const {successResponse,errorResponse} = require('../utils/responseMapper')

// Helper function to find product by ID or SKU
async function findProductByIdOrSku(identifier) {
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        // Valid ObjectId format
        return await Item.findById(identifier);
    } else {
        // Try to find by SKU
        return await Item.findOne({ sku: identifier.toUpperCase() });
    }
}

// Add item to order API
orderRouter.post('/api/v1/addItemToOrder', verifyToken, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user.id;  

        if (!productId) {
            return res.status(400).send(errorResponse("Product ID is required"));
        }

        const product = await findProductByIdOrSku(productId);
        if (!product || !product.isActive) {
            return res.status(404).send(errorResponse("Product not found or inactive"));
        }

        if (product.stock < quantity) {
            return res.status(400).send(errorResponse("Insufficient stock"));
        }

        let order = await Order.findOne({ 
            userId: userId, 
            status: 'open' 
        });

        if (!order) {
            const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            order = new Order({
                orderId,
                userId,
                status: 'open',
                lines: [],
                totalAmount: 0
            });
        }

        const existingLineIndex = order.lines.findIndex(line => 
            line.productId.toString() === product._id.toString() && line.status === 'active'
        );

        if (existingLineIndex !== -1) {
            order.lines[existingLineIndex].quantity += quantity;
        } else {
            order.lines.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity,
                status: 'active'
            });
        }

        order.totalAmount = order.lines
            .filter(line => line.status === 'active')
            .reduce((total, line) => total + (line.price * line.quantity), 0);

        order.updatedAt = new Date();
        

         const updatedOrder = await order.save();

        res.status(200).send(successResponse(updatedOrder));

    } catch (err) {
        console.error('Error adding item to order:', err);
        res.status(500).send(errorResponse(err));
    }
});


// Mark order as fulfilled (payment completed)
orderRouter.put('/api/v1/fulfillOrder/:orderId', verifyToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentMethod, transactionId } = req.body;
        const userId = req.user.id;

        const order = await Order.findOne({ 
            orderId: orderId, 
            userId: userId,
            status: 'open'
        });

        if (!order) {
            return res.status(404).send(errorResponse("Open order not found"));
        }

        // Update order status and payment info
        order.status = 'fulfilled';
        order.paymentInfo = {
            method: paymentMethod || 'unknown',
            transactionId: transactionId || null,
            paidAt: new Date()
        };
        order.updatedAt = new Date();

        // Update stock for all items in the order
        for (const line of order.lines) {
            if (line.status === 'active') {
                await Item.findByIdAndUpdate(
                    line.productId,
                    { $inc: { stock: -line.quantity } }
                );
            }
        }

        await order.save();

        res.status(200).send(successResponse({
            message: "Order fulfilled successfully",
            orderId: order.orderId,
            totalAmount: order.totalAmount
        }));

    } catch (err) {
        console.error('Error fulfilling order:', err);
        res.status(500).send(errorResponse(err.message));
    }
});

// Void/Cancel order
orderRouter.put('/api/v1/voidOrder/:orderId', verifyToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({ 
            orderId: orderId, 
            userId: userId,
            status: { $in: ['open'] }
        });

        if (!order) {
            throw new Error("Order not found")
        }
        order.status = 'cancelled';
        order.updatedAt = new Date();
        order.lines.map((orderLine)=>{
            orderLine.status = 'cancelled'
        })
        const voidedOrder = await order.save();

        res.status(200).send(successResponse(voidedOrder));

    } catch (err) {
        console.error('Error voiding order:', err);
        res.status(500).send(errorResponse(err));
    }
});

// Remove/Cancel specific line item from order
orderRouter.put('/api/v1/removeLineItem/:orderId/:lineIndex', verifyToken, async (req, res) => {
    try {
        const { orderId, lineIndex } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({ 
            orderId: orderId, 
            userId: userId,
            status: 'open'
        });

        if (!order) {
            return res.status(404).send(errorResponse("Open order not found"));
        }

        const lineIdx = parseInt(lineIndex);
        if (lineIdx < 0 || lineIdx >= order.lines.length) {
            return res.status(400).send(errorResponse("Invalid line index"));
        }

        const lineItem = order.lines[lineIdx];
        if (lineItem.status === 'cancelled') {
            return res.status(400).send(errorResponse("Line item already cancelled"));
        }

        // Mark line item as cancelled
        lineItem.status = 'cancelled';
        lineItem.cancelledAt = new Date();

        // Recalculate total amount
        order.totalAmount = order.lines
            .filter(line => line.status === 'active')
            .reduce((total, line) => total + (line.price * line.quantity), 0);

        order.updatedAt = new Date();
        await order.save();

        res.status(200).send(successResponse({
            message: "Line item removed successfully",
            orderId: order.orderId,
            totalAmount: order.totalAmount
        }));

    } catch (err) {
        console.error('Error removing line item:', err);
        res.status(500).send(errorResponse(err.message));
    }
});

// Get specific order for user
orderRouter.get('/api/v1/getOrderDetails/:orderId',verifyToken,async(req,res)=>{
    const orderId = req?.params?.orderId
    const userId = req?.user?._id
    try{
        const orderDetails = await Order.findOne({orderId: orderId , userId:userId}).populate('lines.productId', 'name price images')
        if(!orderDetails){
            throw new Error("Order not found!!!")
        }
        res.status(200).send(successResponse({
            message: "Order details retrieved successfully",
            order: orderDetails
        }))
    }catch(err){
        res.status(404).send(errorResponse(err))
    }
})

module.exports = orderRouter
