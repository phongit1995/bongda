require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
let path = require('path');
let session = require('express-session');
let flash = require('connect-flash');
const mongoose = require('mongoose');
let passport = require("passport");
let passportLocal = require("passport-local");
let LocalStrategy = passportLocal.Strategy;
let userModels = require('./models/user');
let bongdaModels = require('./models/bongda');
// Router
let app = express();
// socket IO 
mongoose.connect(process.env.MONGO_DB, {useNewUrlParser: true,useUnifiedTopology: true ,useFindAndModify: false  },(erro)=>{
  if(erro){
    console.log("Lỗi " + erro);
  }else{
    console.log("Connected to mongodb " + process.env.MONGO_DB);
  }
});

app.use(express.static(path.join(__dirname , './../public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views',path.join(__dirname,'/views'));
app.set('view engine','ejs');
app.use(session({
    secret: 'phong nguyen',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge:1000*60*60*12
    }
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.get('/', checkIsLogin,async(req,res)=>{
    res.render('index');
})
app.get('/login',(req,res)=>{
    res.render('login');
})
app.post('/login', passport.authenticate('local', { successRedirect: '/',
failureRedirect: '/login' }))
app.listen(process.env.PORT,()=>{
    console.log('Web listen on port :' + process.env.PORT);
})
app.post('/sut',async(req,res)=>{
    console.log(req.body);
})
passport.use(new LocalStrategy({
    usernameField:"username",
    passwordField:"password",
    passReqToCallback:true
}, async (req,username,password,done)=>{
    try{
        console.log(username,password);
        let user = await userModels.findOne({username:username,password:password});
        
        if(user){
            console.log(user);
            done(null,user)
        }else{
            done(null,false);
        }
       
    }
    catch(error){

    }
}))
passport.serializeUser((user,done)=>{
    done(null,user);
})
passport.deserializeUser( async (user,done)=>{
    done(null,user);
})
function checkIsLogin (req,res,next){
    
    if(req.isAuthenticated()){
         return next();
    }
    return res.redirect("/login");
}