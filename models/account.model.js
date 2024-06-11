const mongoose = require("mongoose");
const generate = require("../helpers/generate");
const accountSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    tokenAdmin:{
        type: String,
        default: generate.generateRandomString(25)
    },
    phone: String,
    role: String,
    deleted: {
        type: Boolean,
        default: false
    },
    deleteAt: Date
}, { timestamps: true });

const Account = mongoose.model("Account", accountSchema, "account");

module.exports = Account;