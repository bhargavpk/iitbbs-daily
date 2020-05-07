const jwt = require('jsonwebtoken');
const User = require('../../db/models/user');

const auth = async function(req,res,next){
    try{
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token,process.env.JWT_STRING);
        const user = await User.findOne({_id:decoded._id.toString(),'tokens.token':token});
        if(!user)
            throw new Error();
        else{
            req.user = user;
            req.token = token;
            next();
        }
    }catch(e){
        res.send({error:'Please authenticate'});
    }
    
}

module.exports = auth;