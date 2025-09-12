const express = require('express')
const app = express()
const port = 8080
const bcrypt = require('bcrypt'); // hashes password or encrypts or decrypts password
app.use(express.json()) // middleware
const db_conn = require('./db_connection')
const { getToken, setToken, verifyToken } = require('./utils/token')
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const Item = require('./models/item.schema')
const User = require('./models/user.schema');
const WishlistItem = require('./models/whishlist.schema')
const {isAdmin} = require('./utils/commonUtils')



// Add item to catalog

// Add Item
app.post('/api/v1/addItem', verifyToken,isAdmin, async (req, res) => {
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
app.get('/api/v1/getAllUsers', async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json(users);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})

// GET items by category
app.get('/api/v1/getItems/:category', verifyToken, async (req, res) => {
    try {
        const category = req?.params?.category
        const items = await Item.find({ category: category })
        res.status(200).send(items)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

app.post('/api/v1/userLogin', async (req, res) => {
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

//wishlist
app.post('/api/v1/addItemToWishList', verifyToken, async (req, res) => {
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

app.get('/api/v1/getWishListItem', verifyToken, async (req, res) => {
    try {
        const userId = req.user?._id
        const wishlistItem = await WishlistItem.find({userId:userId}) .populate("productId", "name category sku price stock images"); 
        res.status(200).json(wishlistItem);
    } catch (error) {
         res.status(500).send(error.message)
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


