const jwt  = require('jsonwebtoken')


function getToken(userId){
    const token = jwt.sign({id:userId},'Mytra@app',{expiresIn:'1hr'})
    return token
}

function setToken(res,token){
    res.cookie('token',token,{
        httpOnly:true,
        maxAge:3600000 // 1 hr
    });
}


module.exports = {getToken,setToken}