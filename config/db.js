const mongoose = require("mongoose");

 const db = async ()=>{
        await mongoose.connect("mongodb://localhost:27017/revision")
        .then(() => {
            console.log("database connected");
        })
        .catch(err => {
            console.log("error:", err);
        });
 } 

module.exports = db;