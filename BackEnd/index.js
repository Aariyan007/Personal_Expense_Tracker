const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const db = require('./Db/db');
const cors = require('cors');
const connectToDatabase = require('./Db/mdb');
const cookie = require('cookie-parser');


 
const userRoutes = require('./routes/user.routes');

connectToDatabase();

app.use(cookie());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

app.get('/',(req,res)=>{
    console.log("Server is running");
    res.send("Hello World");
})

app.use('/user',userRoutes);

module.exports = app;