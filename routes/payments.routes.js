
const express=require("express");
const paymentsRouter=express.Router();
const Payment = require('../models/user.schema');
const {setToken , getToken , verifyToken} = require('../utils/token');
const { successResponse , errorResponse} = require('../utils/responseMapper');

const router = express.Router();

router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, supportedNetworks } = req.body;
    const newPayment = new Payment({
      name,
      description,
      supportedNetworks,
      createdBy: req.user.id,
    });
    await newPayment.save();
    res.status(201).json({ message: "Payment option added", payment: newPayment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/", verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ isActive: true });
    res.status(200).json({ count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = paymentRouter;