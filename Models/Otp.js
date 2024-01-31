const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    otp: {
        type: String,
    },
    expiry: {
        type: Date,
    }
});

module.exports = { Otp: mongoose.model("Otp", otpSchema) };