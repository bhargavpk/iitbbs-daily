const express = require('express');
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcrypt');
const User = require('./../db/models/user');
const Post = require('./../db/models/post');
const auth = require('../src/middleware/auth');

require('./../db/mongoose');
const port = process.env.PORT;

const app = express();

const publicPath = path.join(__dirname,'../public');
const viewsPath = path.join(__dirname,'../templates/views');
const partialsPath = path.join(__dirname,'../templates/partials');


app.use(express.static(publicPath));
app.set('view engine','hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);
app.use(express.json());

app.get('/', (req,res) => {
    res.render('index');
});

app.get('/test_success',(req,res)=>{
    res.send({
        info: req.headers
    })
})

app.post('/signup',async (req,res)=>{
    try{
        const userTemp = req.body;
        userTemp.password = await bcrypt.hash(userTemp.password,8);
        const user = new User(userTemp);
        const findUser = await User.findOne({userName:user.userName});
        if(findUser)
            res.send({error_mess:'User name already exists!'});
        else
        {
            const token = await user.generateAuthToken();
            res.send({success:true,user,token});
        }
    }catch(e){
        res.send({error:e});
    }
});

app.post('/login',async (req,res) => {
    const userFind = req.body;
    try{
        const user = await User.findOne({userName:userFind.userName});
        if(user)
        {
            const status = await bcrypt.compare(userFind.password,user.password);
            if(status)
            {
                const token = await user.generateAuthToken();
                res.send({
                    found:true,
                    status_pass:'right',
                    user,
                    token
                });
            }
            else
                res.send({
                    found:true,
                    status_pass:'wrong'
                })
        }
        else
            res.send({found:false});
    }catch(e)
    {
        res.send({error:e});
    }
});

app.get('/user',async (req,res)=>{
    if(!req.query.username)
        res.render('error');
    else
    {
        try{
            res.render('user',{userName:req.query.username});
        }catch(e){res.send({error:e})}
    }
})

app.post('/user/auth',auth,async (req,res) => {
    try{
    if(req.user.userName !== req.body.username)
        res.send({error:'Login to continue'});
    else
        res.send({status:true});
    }catch(e){
        res.send({error:e});
    }
})

app.post('/user/post',auth,async (req,res)=>{
    try{
        if(req.user.userName === req.body.author)
        {
            const postObj = new Post(req.body);
            await postObj.save();
            res.send({
                success:true,
                post:postObj
            });
        }
        else
            res.send({error:'Login to post!'})
    }catch(e){
        res.send({error:'Post cant be empty'});
    }
});

app.get('/get_all_posts',async (req,res) => {
    const postList = await Post.find({}).sort({createdAt:-1});
    res.send(postList);
});
app.get('/user/get_posts',async (req,res) => {
    const userName = req.query.user;
    const postList = await Post.find({resolves: {$ne: userName}}).sort({createdAt:-1}).skip(req.query.skip*10).limit(10);
    res.send(postList);
});

app.patch('/patch_post',auth,async (req,res) => {
    if(req.user.userName != req.body.user)
        res.send({error:'Login to continue!'});
    else{
    const postId = req.body.id;
    var newPost;
    try{
        const postObj = await Post.findOne({_id:postId,resolves:req.body.user});
        if(!postObj)
        {
                if(req.query.update === 'inc')
                {
                    newPost = await Post.findByIdAndUpdate(postId,
                        {
                            $inc:{numApproves:1},
                            $push:{resolves:req.body.user}
                        },{new:true,runValidators:true})
                }
                else if(req.query.update === 'dec')
                {
                    newPost = await Post.findByIdAndUpdate(postId,
                        {
                            $inc:{numDisapproves:1},
                            $push:{resolves:req.body.user}
                        },{new:true,runValidators:true})
                }
                res.send(newPost);
        }
        else
            res.send({status:true});    
    }catch(e){
        res.send({error:e});
    }
}
})

app.get('/account',async (req,res) => {
    if(!req.query.username)
        res.render('error');
    else{
        try{
            const user = await User.findOne({userName:req.query.username});
            if(user)
                res.render('account',{
                    name:user.name,
                    userName:user.userName,
                    email:user.email
                });
            else
                res.send({error:"No user found"});
        }catch(e){
            res.send({error:e});
        }
    }
})

app.get('/user_posts',async (req,res) => {
    try{
        const user = await User.findOne({userName:req.query.username});
        if(user)
        {
            await user.populate('posts').execPopulate();
            const postList = user.posts.reverse();
            res.send(postList);
        }
    }
    catch(e){}
})

app.get('/about',async (req,res) => {
    res.render('about');
});

app.post('/logout',auth,async (req,res) => {
    try{
        if(req.query.username === req.user.userName)
        {
            req.user.tokens = req.user.tokens.filter((token) => {
                return token.token !== req.token
            });
            await req.user.save();
            res.send({
                status:true,
                user:req.user
            })
        }
        else
            res.send({status:false});
    }catch(e){
        res.send({error:e});
    }
});

app.get('/*',(req,res) => {
    res.render('error');
})

app.listen(port,()=>{
    console.log('Server listening to port '+port);
});