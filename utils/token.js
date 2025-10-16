const jwt  = require('jsonwebtoken')
const User = require('../models/user.schema');


function getToken(userId){
    const token = jwt.sign({id:userId},'Myntra@app',{expiresIn:'1hr'})
    return token
}

function setToken(res,token){
    res.cookie('token',token,{
        httpOnly:true,
        maxAge:3600000 // 1 hr
    });
}

async function verifyToken(req,res,next){
    try {
        const token = req?.cookies?.token; // Assuming the token is stored in a cookie
        if (!token) {
            return res.status(401).send('Unauthorized: Please try logging in again');
        }
        const decoded = jwt.verify(token, 'Myntra@app'); // Verify the token
        const {id} =  decoded; // Extract user ID from the decoded token
        const userData = await User.findById(id);
        if (!userData) {
            return res.status(404).send('User not found')   ;
        }
        req.user = userData; // Attach user data to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(401).send('Unauthorized: Invalid token');
    }
}



module.exports = {getToken,setToken,verifyToken}