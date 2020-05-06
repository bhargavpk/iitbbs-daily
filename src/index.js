const express = require('express');
const path = require('path');
const hbs = require('hbs');
const User = require('./../db/models/user');
const Post = require('./../db/models/post');

require('./../db/mongoose');
const port = process.env.PORT || 3000;

const app = express();

const publicPath = path.join(__dirname,'../public');
const viewsPath = path.join(__dirname,'../templates/views');
const partialsPath = path.join(__dirname,'../templates/partials');

app.use(express.static(publicPath));
app.set('view engine','hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);
app.use(express.json());    //To parse incoming JSON

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
        const user = new User(req.body);
        const findUser = await User.findOne({userName:user.userName});
        if(findUser)
            res.send({error_mess:'User name already exists!'});
        else
        {
            await user.save();
            res.send({success:true});
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
            if(userFind.password === user.password)
            {
                const user_new = await User.findByIdAndUpdate(user._id,{login_stat:true},{new:true});
                console.log(user_new);
                res.send({
                    found:true,
                    status_pass:'right',
                    id: user._id,
                    username:user_new.userName
                });
            }
            else
                res.send({
                    found:true,
                    status_pass:'wrong'
                })
        }
    }catch(e)
    {
        console.log(e);
        res.send({error:e});
    }
});

app.get('/user',async (req,res)=>{
    //Handle for errors when no query is provided
    try{
    const user = await User.findOne({userName:req.query.username});
    // if(user.login_stat === true)
    // {
    //     const newUser = await User.findByIdAndUpdate(user._id,{
    //         login_stat:false
    //     },{new:true})
    //     res.render('user',{userName:req.query.username});
    // }
    // else
    //     res.send({error:'You didnt login'});
    res.render('user',{userName:req.query.username});
}catch(e){res.send({error:e})}

})

app.post('/post',async (req,res)=>{
    try{
        const postObj = new Post(req.body);
        await postObj.save();
        res.send({
            success:true,
            post:postObj
        });
    }catch(e){
        res.send({error:e});
    }
});

app.get('/get_all_posts',async (req,res) => {
    const postList = await Post.find({}).sort({createdAt:-1});
    res.send(postList);
});
app.get('/get_posts',async (req,res) => {
    const userName = req.query.user;
    const postList = await Post.find({resolves: {$ne: userName}}).sort({createdAt:-1}).skip(req.query.skip*10).limit(10);
    res.send(postList);
});

app.patch('/patch_test',async (req,res)=>{
    const postId = req.body.id;
    try{
        const postObj = await Post.findOne({_id:postId,resolves:req.query.user});
        if(postObj)
            res.send({status:true});
        else
            res.send({status:false});
    }catch(e){
        res.send({error:e})
    }
})

app.patch('/patch_post',async (req,res) => {
    const postId = req.body.id;
    var newPost;
    try{
         if(req.body.status === false)
         {
             if(req.query.update === 'inc')
             {
                newPost = await Post.findByIdAndUpdate(postId,
                    {
                        $inc:{numApproves:1},
                        $push:{resolves:req.query.user}
                    },{new:true,runValidators:true})
             }
            else if(req.query.update === 'dec')
            {
                newPost = await Post.findByIdAndUpdate(postId,
                    {
                        $inc:{numDisapproves:1},
                        $push:{resolves:req.query.user}
                },{new:true,runValidators:true})
            }
         }
         else
            newPost = await Post.findById(postId);
        //Handle error when query is not appropriate
    res.send(newPost);
    }catch(e){
        res.send({error:e});
    }
})

app.get('/account_test',async (req,res) => {
    try{
        const user = await User.findOne({userName:req.query.username});
        if(user)
            res.send({status:true});
        else
            res.send({status:false});
    }catch(e){
        res.send({error:e});
    }
})
app.get('/account',async (req,res) => {
    //Handle query errors
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
})

app.listen(port,()=>{
    console.log('Server listening to port '+port);
});