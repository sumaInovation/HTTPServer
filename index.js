var express = require("express");
const bcrypt = require('bcrypt');
var cors = require("cors");
var nodemailer = require('nodemailer');
var app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
const mongoose = require("mongoose");
const dbUrl =
  "mongodb+srv://suma:123@cluster0.wxldekr.mongodb.net/?retryWrites=true&w=majority";
const Schema = mongoose.Schema;
// Name, Number,Course, email, password
let newuserSchema = new Schema({
  Name: {
    type: String,
  },
  Number: {
    type: String,
  },
  Course: {
    type: String,
  },
  Email: {
    type: String,
  },
  Password: {
    type: String,
  },
});
const userDeatils = mongoose.model("newuser", newuserSchema);

let newuserSchema1 = new Schema({
  Email:{
    type:String
  },
  OTPNO:{
    type:String
  }
});
const userOTP = mongoose.model("userOTP", newuserSchema1);

  
//Email thread initialization
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sumanga0000@gmail.com',
    pass: 'cnpi ldky hhgb cpwe'
  }
});

// This is my backend API

app.get("/", (req, res) => {
  
  res.end('<h1 >WELCOME TO SUMAAUTOMATIONLK</h1>');
});
app.post("/registration", (req, res) => {
  mongoose
    .connect(dbUrl)
    .then(() => console.log("connected"))
    .catch((error) => console.log(error));

  userDeatils
    .find({ Email: req.body.Email })
    .then((result) => {
      if (result.length === 0) {
        const myPlaintextPassword = req.body.Password;
        const hashpassword = bcrypt.hashSync(myPlaintextPassword, 10);
        const userDeatils1 = new userDeatils({
          Name: req.body.Name,
          Course: req.body.Course,
          Number: req.body.Number,
          Email: req.body.Email,
          Password: hashpassword,
        });

        userDeatils1.save();
        res.send(userDeatils1);
      } else {
        console.log("Already exsiting");
        res.send("Already exsiting");
      }
    })
    .catch((error) => console.log(error));

});

//Data Login path*************************************************
app.post('/login', (req, res) => {
  userDeatils
    .find({ Email: req.body.Email })
    .then((result) => {
      if (bcrypt.compareSync(req.body.Password, result[0].Password)) {
        res.send("password match")
      } else {
        res.send("password incorrect")
      }

    })
    .catch(error => {
      res.send('Invalid user name');
    })
})
app.listen(3001, function () {
  console.log("CORS-enabled web server listening on port 3001");
});


app.post('/verify',(req,res)=>{
const opt=`${Math.floor(1000+Math.random()*9000)}`
const hashotp=bcrypt.hashSync(opt, 10);

mongoose
  .connect(dbUrl)
  .then(() => console.log("connected"))
  .catch((error) => console.log(error));
  const newOTP=new userOTP({
    Email:'sumanga0000@gmail.com',
    OTPNO:hashotp
    });
    newOTP.save();
  var mailOptions = {
    from: 'sumanga0000@gmail.com',
    to: 'sumanga0000@gmail.com',
    subject: 'OTP Verification',
    html:`<h1>OTP : ${opt}</h1>`
  };



  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
res.send('sent email.')
})
app.post('/verified',(req,res)=>{
  userOTP
  .find({ Email: req.body.Email })
  .then((result) => {
    if(result.length>=0){
      if (bcrypt.compareSync(req.body.otp, result[0].)) {

      }
    }

  })
  .catch(error=>{

  })


})