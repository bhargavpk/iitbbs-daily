const mongoose = require('mongoose');
const validator = require('validator');

const postSchema = new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true,
        validate(value){
            if(value === '')
                throw new Error('Post cant be empty!');
        }
    },
    author:{
        type:String,
        required:true,
        ref:'User'
    },
    numApproves:{
        type:Number,
        default:0
    },
    numDisapproves:{
        type:Number,
        default:0
    },
    resolves:{
        type:[String],
        default:[]
    }
},{
    timestamps: true
});


const Post = mongoose.model('Post',postSchema);

module.exports = Post;