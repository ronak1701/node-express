const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    id : {
        type : Number,
        required : true,
        unique : true
    },
    name : {
        type : String,
        required : true
    },
    age : {
        type:Number,
        required : true
    },
    city : {
        type:String,
        required : true
    }
})

const User = mongoose.model("user",userSchema)

module.exports = User
