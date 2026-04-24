const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username:String,
    name: String,
    email: String,
    age:Number,
    password: String,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"post"
        }
    ],
    profilepic:{
        type: String,
        default: "defaultImage.png"
    }
})

module.exports = mongoose.model("user", userSchema);