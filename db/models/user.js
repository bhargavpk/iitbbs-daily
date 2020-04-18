const mongoose = require('mongoose');
const validator = require('validator');

const User = mongoose.model('User',{
    name:{
        firstName:{
            type:String,
            required:true,
            trim:true,
            validate(value){
                if(!validator.isAlpha(value))
                    throw new Error('All characters of first name must be alphabets!');
            }
        },
        lastName:{
            type:String,
            required:true,
            trim:true,
            validate(value){
                if(!validator.isAlpha(value))
                    throw new Error('All characters of last name must be alphabets!');
            }
        },
    },
    userName:{
        type:String,
        required:true,
        //Add default later(if necessary)
        validate(value){
            if(value.length<4)
                throw new Error('User name too short!');
            if(value.length>15)
                throw new Error('User name too long!');
        }
    },
    email:{
        type:String,
        required:true,
        validate(value){
            if(!validator.isEmail(value))
                throw new Error('Invalid user name!');
        }
    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(value.length<5)
                throw new Error('Password too short!');
            if(validator.isAlpha(value))
                throw new Error('Password should contain at least one special character!');
        }
    },
    login_stat:{
        type:Boolean,
        default:false
    }
    //Add additional fields when required
});

module.exports = User;