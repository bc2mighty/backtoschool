const mongoose = require("mongoose")

const DonationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    local_government: {
        type: String,
        required: true
    },
    txRef: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    cause: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Donations",DonationSchema)
