var express = require("express");
const {google}=require('googleapis');
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
  StartDate: {
    type: String
  },
  EndDate: {
    type: String
  },
  Due: {
    type: String
  }
});
const userDeatils = mongoose.model("newuser", newuserSchema);

// User verification code
let verficationcode = new Schema({
  _id: {
    type: String,
  },
  _verificatio: {
    type: String,
  }

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
      const today = new Date();

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
          StartDate: today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate(),
          EndDate: today.getFullYear() + "-" + (today.getMonth() + 5) + "-" + today.getDate(),


        });
        ////////////////////////////////////////////
        newUserDetails
          .save()
          .then(() => {
            // Genarate user verification code & save in MongoDB
            const uniqestring = uuidv4() + req.body.Email;
            const currentURL = "https://http-server-r3wc.onrender.com/verification";
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
                  to: req.body.Email,
                  subject: "Verifcation Link",
                  html: `<p>Welcome to sumaautomation.lk please click  <a href=${currentURL +
                    "/?emailid=" +
                    req.body.Email +
                    "&uniqestring=" +
                    uniqestring
                    }>here to varify your account</a></p>`,
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
app.post('/login', (req, res) => {
  mongoose
    .connect(dbUrl)
    .then(() => console.log("connected"))
    .catch((error) => {
      console.log(error)
      res.send({"Status":"Time Out"})
    });

  userDeatils
    .find({ Email: req.body.Email })
    .then(result => {
      if (result) {
        if (bcrypt.compareSync(req.body.Password, result[0].Password)) {
          res.send(result[0])
        } else {
          res.send({ "status": "Wrong Password"})
        }
      } else {
        res.send({ "status": "Connot find user name" })
      }


    })
    .catch(error => {
      res.send({ "status": "Error" })
     })
})

// Google API 

app.get('/googlesheet',async(req,res)=>{


    const auth = new google.auth.GoogleAuth({
        keyFile: "credintial.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
      });
    
      // Create client instance for auth
      const client = await auth.getClient();
    
      // Instance of Google Sheets API
      const googleSheets = google.sheets({ version: "v4", auth: client });
    
      const spreadsheetId = "1FqDYvM882mvhibdWgA1Xe6vcClrrHC5Z3pODAR5gKN4";
    
      // Get metadata about spreadsheet
      const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
      });
    
      // Read rows from spreadsheet
      const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range:"sheet1!A:A"
      });
      
  //     // Write row(s) to spreadsheet
  // await googleSheets.spreadsheets.values.append({
  //   auth,
  //   spreadsheetId,
  //   range: "Sheet1!A:B",// start colum A and end colum B
  //   valueInputOption: "USER_ENTERED",
  //   resource: {
  //     values: [["NextUser","Hello User"]],// Data in colum A then B act
  //   },
  // });
   for(key in getRows.data.values){
    if(getRows.data.values[key]==11){
      console.log('Found Result')
    }
    
   }
    res.send('hello');
})








































