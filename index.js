const express = require('express')
const app = express()
const cors=require('cors');
app.use(cors({origin:'*'}));
app.get('/',(req,res)=>{
    console.log(req.method);
    res.end("hello");
})
app.listen(8090,()=>console.log("Server is running"))