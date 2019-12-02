const mongoose = require("mongoose")

const AgentSchema = new mongoose.Schema({
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
    }
})

module.exports = mongoose.model("Agent", AgentSchema)
