const express = require('express');
const app = express();
const db = require('./Db/db');
const cors = require('cors');
const cookie = require('cookie-parser');

const userRoutes = require('./routes/user.routes');

app.use(cookie());
app.use(cors())
app.use(express.json());

app.get('/',(req,res)=>{
    console.log("Server is running");
    res.send("Hello World");
})

app.use('/user',userRoutes);

module.exports = app;