const express = require('express');
const app = express();

app.use(cors())
app.use(express.json());

app.get('/',(req,res)=>{
    console.log("Server is running");
    res.send("Hello World");
})

module.exports = app;