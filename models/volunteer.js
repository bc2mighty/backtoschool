const mongoose = require("mongoose")

const VolunteerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email_address: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    occupation: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Volunteers",VolunteerSchema)
