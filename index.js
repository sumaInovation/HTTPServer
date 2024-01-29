var express = require("express");
var cors = require("cors");
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

mongoose
  .connect(dbUrl)
  .then(() => console.log("connected"))
  .catch((error) => console.log(error));

// This is my backend API

app.get("/", (req, res) => {
  console.log("hello");
  res.end("get responde");
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
        console.log("Successfuly");
        const userDeatils1 = new userDeatils({
          Name: req.body.Name,
          Course: req.body.Course,
          Number: req.body.Number,
          Email: req.body.Email,
          Password: req.body.Password,
        });
        userDeatils1.save();
        res.send("Successfuly");
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
