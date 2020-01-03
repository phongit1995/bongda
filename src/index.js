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
    console.log(req.user);
    let listBong = await bongdaModels.find({
        status:false ,
        idsend:{
            $ne:req.user._id
        }
    })
    console.log(listBong);
    res.render('index',{message:req.flash('message'),user:req.user,listBong:listBong});
})
app.get('/login',(req,res)=>{
    res.render('login');
})
app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect("/");
})
app.post('/login', passport.authenticate('local', { successRedirect: '/',
failureRedirect: '/login' }))
app.listen(process.env.PORT,()=>{
    console.log('Web listen on port :' + process.env.PORT);
})
app.get('/bat/:id/:type',checkIsLogin,async(req,res)=>{
    let {id,type} = req.params ;
    let bong = await bongdaModels.findById(id);
    if(!bong || bong.status==true){
        req.flash('message',{error:'Không Hợp Lệ'})
        return res.redirect('/');
    }
    if(bong.xu>req.user.xu){
        req.flash('message',{error:'Bạn Không Đủ Xu'})
        return res.redirect('/');
    }
    let typebat = false ;
    if(type=='left'){
        typebat = false ;
    }
    if(type=='right'){
        typebat = true ;
    }
    console.log(bong);
    let xuadd  = (bong.xu * 80)/100 ;
    if(bong.sut==typebat){
        
        await userModels.findByIdAndUpdate(req.user._id,{xu:req.user.xu+xuadd});
        req.flash('message',{error:null,message:`Bắt Thành Công Bạn Được Cộng : ${xuadd} xu`});
        await bongdaModels.findByIdAndUpdate(bong._id,{status:true,bat:typebat,idReceive:req.user._id});
        return res.redirect('/');
    }else {
        await userModels.findByIdAndUpdate(req.user._id,{xu:req.user.xu-bong.xu});
        let usersSend = await userModels.findById(bong.idsend);
        await userModels.findByIdAndUpdate(usersSend._id,{xu:usersSend.xu+bong.xu+xuadd});
        req.flash('message',{error:`Bắt Hụt Bạn Bị Trừ  : ${bong.xu} xu`});
        await bongdaModels.findByIdAndUpdate(bong._id,{status:true,bat:typebat,idReceive:req.user._id});

        return res.redirect('/');
    }
})
app.post('/sut',async(req,res)=>{
    console.log(req.body);
    let {money,type}= req.body;
    if(money>req.user.xu){
        req.flash('message',{error:'Bạn Không Đủ Xu'});
    }
    let newxu = req.user.xu-money ;
    let sut = false ;
    if(type=='right'){
        sut=true ;
    }
    await bongdaModels.create({idsend:req.user._id,userNameSend:req.user.username,sut:sut,xu:money});
    await userModels.findByIdAndUpdate({_id:req.user._id},{xu:newxu});
    req.flash('message',{error:null,message:`Bạn Đã Sút Thành Công : ${money} xu`})
    return res.redirect('/');

})
passport.use(new LocalStrategy({
    usernameField:"username",
    passwordField:"password",
    passReqToCallback:true
}, async (req,username,password,done)=>{
    try{
       
        let user = await userModels.findOne({username:username,password:password});
        
        if(user){
            console.log(user);
            done(null,user._id)
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
    let userInfo = await userModels.findById(user);
    done(null,userInfo);
})
function checkIsLogin (req,res,next){
    
    if(req.isAuthenticated()){
         return next();
    }
    return res.redirect("/login");
}