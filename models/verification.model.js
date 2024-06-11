const mongoose = require("mongoose");
const verificationSchema = new mongoose.Schema({
    email: String,
    otp: String,
    expireAt:{
        type: Date,
        expires: 180
    }
}, { timestamps: true });

const Verification = mongoose.model("Verification", verificationSchema, "verification");

module.exports = Verification;