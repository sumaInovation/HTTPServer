var express = require("express");
const bcrypt = require("bcrypt");
var cors = require("cors");
var nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
require('dotenv').config();
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
  Verification: {
    type: Boolean,
  },
});
const userDeatils = mongoose.model("newuser", newuserSchema);

// User verification code
let verficationcode = new Schema({
  _id: {
    type: String,
  },
  _verificatio: {
    type: String,
  },
});
const userverficationcode = mongoose.model("verfication", verficationcode);

//Email thread initialization
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sumanga0000@gmail.com",
    pass: "cnpi ldky hhgb cpwe",
  },
});

// This is my backend API

app.get("/", (req, res) => {
  res.end("<h1 >WELCOME TO SUMAAUTOMATIONLK</h1>");
});

//User registration
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
        const newUserDetails = new userDeatils({
          Name: req.body.Name,
          Course: req.body.Course,
          Number: req.body.Number,
          Email: req.body.Email,
          Password: hashpassword,
          Verification: false,
        });
        ////////////////////////////////////////////
        newUserDetails
          .save()
          .then(() => {
            // Genarate user verification code & save in MongoDB
            const uniqestring = uuidv4() + req.body.Email;
            const currentURL ="https://http-server-r3wc.onrender.com/verification";
            const hashverfication = bcrypt.hashSync(uniqestring, 10);
            const newverficationcode = new userverficationcode({
              _id: req.body.Email,
              _verificatio: hashverfication,
            });
            // Save verfication email deatils in MongoDB
            newverficationcode
              .save()
              .then(() => {
                // Send Mail

                var mailOptions = {
                  from: "sumanga0000@gmail.com",
                  to: "sumanga0000@gmail.com",
                  subject: "Sending Email using Node.js",
                  html: `<p>link <a href=${
                    currentURL +
                    "/?emailid=" +
                    req.body.Email +
                    "&uniqestring=" +
                    uniqestring
                  }>press</a></p>`,
                };

                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log(error);
                    res.send("Failed Email send");
                  } else {
                    console.log("Email sent: " + info.response);
                    res.send("OK");
                  }
                });
              })
              .catch(() => {
                console.log("Error");
                res.send("Error");
              });
          })
          .catch(() => {
            console.log("Error");
            res.send("Error");
          });
        ///////////////////////////////////
      } else {
        console.log("Already exsiting");
        res.send("Already exsiting");
      }
    })
    .catch((error) => console.log(error));
});

app.listen(3001, function () {
  console.log("CORS-enabled web server listening on port 3001");
});
// Verfication Email
app.get("/verification", (req, res) => {
  userverficationcode
    .find({ _id: req.query.emailid })
    .then((result) => {
      if (result.length > 0) {
        // should compare verification code
        if (bcrypt.compareSync(req.query.uniqestring, result[0]._verificatio)) {
          userverficationcode
            .deleteOne({ _id: req.query.emailid })
            .then(() => {
              // update user email verfication as true
              userDeatils
                .find({ Email: req.query.emailid })
                .then((result) => {
                  if (result.length > 0) {
                    userDeatils
                      .updateOne(
                        { Email: req.query.emailid },
                        { Verification: true }
                      )
                      .then(() => {
                        res.send(`Hello ${req.query.emailid}`);
                      })
                      .catch(() => {
                        res.send("connot find acoount please try again");
                      });
                  } else {
                    res.send("connot find acoount please try again");
                  }
                })
                .catch(() => {
                  res.send("connot find acoount please try again");
                });
            })
            .catch((error) => {
              console.log("delete error");
              res.send("Error Occured");
            });
        } else {
          res.send("verification not match");
        }
      } else {
        res.send("Invalid verfication");
      }
    })
    .catch((error) => {
      res.send("Error occured");
    });
});




// User Loging
app.post('/login',(req,res)=>{
  mongoose
    .connect(dbUrl)
    .then(() => console.log("connected"))
    .catch((error) => {console.log(error)
    res.send('Time Out')});
 
userDeatils
    .find({ Email: req.body.Email })
    .then(result=>{
     if(result){
      if (bcrypt.compareSync(req.body.Password, result[0].Password)){
          if(result[0].Verification==true){
            res.send('verified')
          }else{
            res.send('not verified')
          }

         
       
      }else{
      res.send('Wrong Password')
      }
     }else{
      res.send('Connot find user name')
     }
    

    })
    .catch(error=>{
      res.send('Error loging')

    })






})