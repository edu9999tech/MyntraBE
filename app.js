const express = require('express')
const app = express()
const port = 8080
const bcrypt = require('bcrypt'); // hashes password or encrypts or decrypts password
app.use(express.json()) // middleware
const db_conn = require('./db_connection')
const {getToken,setToken,verifyToken} = require('./utils/token')
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const Item = require('./models/item.schema')
const User = require('./models/user.schema');
const e = require('express');



// Add item to catalog

// Add Item
app.post('/api/v1/addItem', async (req, res) => {
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
        res.status(400).json({ error: err.message });
    }
});

// Get All Items
app.get('/api/v1/getAllItems', async (req, res) => {
    try {
        const ItemData = await Item.find();  //  Get all items
        res.status(200).json(ItemData);        // send JSON
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Add new User
app.post('/api/v1/addUser', async (req, res) => {
      const { FirstName, LastName, phoneNumber, Email, Password } = req.body;  // object destructure
    try {
         const hashedPassword  = await bcrypt.hash(Password ,10)
         const user = new User({
            FirstName,
            LastName,
            phoneNumber,
            Email,
            Password: hashedPassword, // store hashed password
        });
        const savedUser = await user.save()
        res.status(200).json(savedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})

//getusers
app.get('/api/v1/getAllUsers', async(req,res)=>{
    try{
        const users = await User.find()
        res.status(200).json(users);
    }catch(err){
        res.status(400).json({ error: err.message });
    }
})

// GET items by category
app.get('/api/v1/getItems/:category',verifyToken,async(req,res)=>{
    try{
        const category = req?.params?.category
        const items = await Item.find({category:category})
        res.status(200).send(items)
    }catch(err){
         res.status(400).send(err.message)
    }
})

app.post('/api/v1/userLogin', async (req, res) => {
    const { Email, Password } = req.body
    try {
        const user = await User.findOne({ Email: Email })
        if (!user) {
            throw new Error('User Not Found')
        }
        const isPasswordValid = await bcrypt.compare(Password, user.Password)
        if (!isPasswordValid) {
            throw new Error('Email or Password Incorrect')
        }
        const userToken = getToken(user._id)
        setToken(res, userToken)
        res.status(200).send(user)

    } catch (err) {
        res.status(500).send(err.message)
    }
})


db_conn().then(() => {
    console.log("DB connected succeefully")
    app.listen(port, (err) => {
        if (err) {
            console.log("Error connecting DB")
        } else {
            console.log(`Server is running on ${port}`)
        }
    })
}).catch((error) => {
    console.log("Error connecting DB ", error)
})

// hash at controller
        //const hashedPassword = await bcrypt.hash(Password, 10);
