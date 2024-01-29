
var express = require('express')
var cors = require('cors')
var app = express()

app.use(express.json())
app.use(cors({origin:'*'}));

// for arduino codes
// app.get('/',(req,res)=>{
//     console.log(req.method);
//     res.end("hello");
// })
// app.listen(8090,()=>console.log("Server is running!!!"))





// This is my backend API

app.post('/', function (req, res) {
 
    req.body; // { answer: 42 }
    res.json(req.body);
    console.log(req.body)
})
app.get('/',(req,res)=>{
    console.log("hello")
    res.end('get responde')
})

app.listen(3001, function () {
  console.log('CORS-enabled web server listening on port 3001')
})
