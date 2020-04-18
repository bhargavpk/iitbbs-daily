const express = require('express');
const path = require('path');
const hbs = require('hbs');
const User = require('./../db/models/user');

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

app.post('/signup',async (req,res)=>{
    const user = new User(req.body);
    try{
        const findUser = await User.findOne({userName:user.userName});
        if(findUser)
            res.send({error_mess:'User name already exists!'});
        else
        {
            await user.save();
            res.send({success:true});
        }
    }catch(e){
        res.send({error: e});
    }
});

app.get('/test_success',(req,res)=>{
    res.render('test_success');
});

app.post('/login',async (req,res) => {
    const userFind = req.body;
    try{
        const user = await User.findOne({userName:userFind.userName});
        if(user)
        {
            if(userFind.password === user.password)
                res.send({
                    found:true,
                    status_pass:'right',
                    id: user._id
                });
            else
                res.send({
                    found:true,
                    status_pass:'wrong'
                })
        }
    }catch(e)
    {
        res.send({error:e});
    }
});

app.listen(port,()=>{
    console.log('Server listening to port '+port);
});