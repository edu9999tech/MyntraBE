const express = require('express');
const userRouter = express.Router()
const bcrypt = require('bcrypt');
const User = require('../models/user.schema');
const {setToken , getToken , verifyToken} = require('../utils/token')

userRouter.post('/api/v1/addUser', async (req, res) => {
    const { FirstName, LastName, phoneNumber, Email, Password, role } = req.body;  // object destructure
    try {
        const hashedPassword = await bcrypt.hash(Password, 10)
        const user = new User({
            FirstName,
            LastName,
            phoneNumber,
            Email,
            Password: hashedPassword, // store hashed password
            role: role || 'user', // default to 'user' if not provided
        });
        const savedUser = await user.save()
        res.status(200).json(savedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})

//getusers
userRouter.get('/api/v1/getAllUsers', async (req, res) => {
    try {
        const users = await User.find()
        delete users?.Password
        res.status(200).json(users);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})


userRouter.post('/api/v1/userLogin', async (req, res) => {
    const { Email, Password } = req.body
    try {
        const user = await User.findOne({ Email: Email });
        if (!user) {
            throw new Error('User Not Found')
        }
        const isPasswordValid = await bcrypt.compare(Password, user.Password)
        if (!isPasswordValid) {
            throw new Error('Email or Password Incorrect')
        }
        const userToken = getToken(user._id, user.role)
        setToken(res, userToken)
        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.Password;
        res.status(200).send(userResponse)

    } catch (err) {
        res.status(500).send(err.message)
    }
})

module.exports = userRouter