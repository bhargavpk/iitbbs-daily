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

app.listen(port,()=>{
    console.log('Server listening to port '+port);
});