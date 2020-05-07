const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name:{
        firstName:{
            type:String,
            trim:true,
            validate(value){
                if(value === '')
                    throw new Error('First name is required!');
                if(!validator.isAlpha(value))
                    throw new Error('All characters of first name must be alphabets!');
            }
        },
        lastName:{
            type:String,
            trim:true,
            validate(value){
                if(value === '')
                    throw new Error('Last name is required!');
                if(!validator.isAlpha(value))
                    throw new Error('All characters of last name must be alphabets!');
            }
        },
    },
    userName:{
        type:String,
        validate(value){
            if(value === '')
                    throw new Error('Username is required!');
            if(value.length<4)
                throw new Error('User name too short!');
            if(value.length>15)
                throw new Error('User name too long!');
        }
    },
    email:{
        type:String,
        validate(value){
            if(value === '')
                    throw new Error('Email is required!');
            if(!validator.isEmail(value))
                throw new Error('Invalid email!');
        }
    },
    password:{
        type:String,
        validate(value){
            if(value === '')
                    throw new Error('Password is required!');
            if(value.length<5)
                throw new Error('Password too short!');
            if(validator.isAlpha(value))
                throw new Error('Password should contain at least one special character!');
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
    //Add additional fields when required
});

userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({_id:this._id.toString()},process.env.JWT_STRING);
    this.tokens = this.tokens.concat({token});
    await this.save();
    return token;
}

userSchema.virtual('posts',{
    ref:'Post',
    localField:'userName',
    foreignField:'author'
})
const User = mongoose.model('User',userSchema);

module.exports = User;