const mongoose = require('mongoose');


function connectToDatabase() {
    console.log(process.env.MONGO_URI);
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("Connected to MongoDB");
    }).catch((err) => {
        console.error("Error connecting to MongoDB:", err);

    });
}   

module.exports = connectToDatabase;