var express = require('express');
const session = require('express-session');
require("dotenv").config();
const { response } = require('../app');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')
var productHelpers = require("../helpers/product-helpers");

  

const client = require("twilio")(
  process.env.ACCOUNT_SID, 
  process.env.AUTH_TOKEN,
  {
    lazyLoading: true,
  }
);

let User_number = "";

/* GET home page. */
router.get('/', function(req, res, next) {
  let user = req.session.user;
 
  let U_session = req.session;
   userHelpers.isExist(U_session)

  // if (userHelpers.isExist(user) === "invalid") {
  //   req.session.destroy((err) => {
  //     console.log("error occured during session destruction");
  //   });
  // }

   productHelpers.getAlluser().then((products) => {
      res.render("index", { products, user });
   });
  

});


router.get('/login', function (req, res) {
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/login',{"loginerr":req.session.loginErr})
    req.session.loginErr=false
  }
 
})
 

//otp section

router.get("/otp-login", function (req, res) {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/otp");
    req.session.loginErr = false;
  }
});

router.post("/otp-verification", function (req, res) {
  userHelpers.NumberExist(req.body.number)
    .then((resp) => {
      if (resp) {
        console.log(resp.Email);
        req.session.user=resp.Email
       const { number } = req.body;
       User_number = number;
       client.verify.services(process.env.SERVICE_SID).verifications.create({
         to: `+91${number}`,
         channel: "sms",
       });
       res.render("user/otp-veri");
      } else {
         res.render("user/otp", { invalidph: "invalid phone number" });
    }
    })


  
});

router.post("/otp-matching", function (req, res) {
  const { otp } = req.body;
  
  client.verify
    .services(process.env.SERVICE_SID)
    .verificationChecks.create({
      to: `+91${User_number}`,
      channel: "sms",
      code: otp,
    })
    .then((resp) => {
      console.log(resp);
      if (resp.valid == true) {
        res.redirect("/");
      }
    });
 
   //res.redirect("/");
  
  
  
});







router.get('/signup', function (req, res) {
  if (req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/signup',{signerr:req.session.signErr,phoneerr:req.session.phnExists})
    req.session.signErr=false
    req.session.phnExists=false
  }
})




router.post('/signup', (req, res) => {
 userHelpers.doSignup(req.body).then((response)=>{
  if (response.status){
    req.session.signErr=true
    res.redirect('/signup')
  } else if (response.phone) {
     req.session.phnExists = true;
      res.redirect("/signup");
  }else {
  res.redirect('/login')
  }
 })
})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if (response.status){
     
      req.session.user=response.user
      req.session.loggedIn=true
      res.redirect('/')
    }else{
      req.session.loginErr=true
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.loggedIn=null
  req.session.user=null
  res.redirect('/')
})
module.exports = router;
