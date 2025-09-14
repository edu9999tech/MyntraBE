const express = require('express');
const itemRouter = express.Router()
const bcrypt = require('bcrypt');
const Item = require('..//models/item.schema');
const WishlistItem = require('../models/whishlist.schema')
const {verifyToken} = require('../utils/token')
const {isAdmin} = require('../utils/commonUtils')
const {successResponse,errorResponse} = require('../utils/responseMapper')


itemRouter.post('/api/v1/addItem', verifyToken,isAdmin, async (req, res) => {
    try {
        let savedItems;

        if (Array.isArray(req.body)) {
            // If it's an array, insertMany
            savedItems = await Item.insertMany(req.body);
        } else {
            // If it's a single object
            const item = new Item(req.body);
            savedItems = await item.save();
        }

        res.status(201).json(savedItems);
    } catch (err) {
        res.status(400).json(errorResponse(err));
    }
});

// Get All Items
itemRouter.get('/api/v1/getAllItems',verifyToken, async (req, res) => {
    try {
        const ItemData = await Item.find();  //  Get all items
        res.status(200).json(successResponse(ItemData));        // send JSON
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

itemRouter.get('/api/v1/getItems/:category', verifyToken, async (req, res) => {
    try {
        const category = req?.params?.category
        const items = await Item.find({ category: category })
        res.status(200).send(items)
    } catch (err) {
        res.status(400).send(err.message)
    }
})


//wishlist
itemRouter.post('/api/v1/addItemToWishList', verifyToken, async (req, res) => {
    try {
        const sku= req.body.productId;

        const userId = req?.user?._id

        // 1. Find product by SKU
        const product = await Item.findOne({ sku });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // 2. Try to insert directly (unique index handles duplicates)
        const wishlistItem = await WishlistItem.create({
            userId,
            productId: product._id
        });

        res.status(201).json({ success: true, wishlistItem });
    } catch (error) {
        res.status(500).send(error.message)
    }
})

itemRouter.get('/api/v1/getWishListItem', verifyToken, async (req, res) => {
    try {
        const userId = req.user?._id
        const wishlistItem = await WishlistItem.find({userId:userId}) .populate("productId", "name category sku price stock images"); 
        res.status(200).json(wishlistItem);
    } catch (error) {
         res.status(500).send(error.message)
    }
})

module.exports = itemRouter
