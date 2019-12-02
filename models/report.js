const mongoose = require("mongoose")

const ReportSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    agentId: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    age_range: {
        type: String,
        required: true
    },
    gender: {
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
    city: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    parent_no: {
        type: String
    },
    cause: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
})

module.exports = mongoose.model("Reports",ReportSchema)
