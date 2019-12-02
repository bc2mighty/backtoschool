const mongoose = require("mongoose")
const User = require("./user")

const UserSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    email_address: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true,
        unique: true
    },
    occupation: {
        type: String
    },
    nationality: {
        type: String
    },
    state_of_origin: {
        type: String
    }
})

module.exports = mongoose.model("User", UserSchema)
