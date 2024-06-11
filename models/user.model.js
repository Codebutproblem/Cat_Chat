const mongoose = require("mongoose");
const generate = require("../helpers/generate");
const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    gender: String,
    tokenUser:{
        type: String,
        default: generate.generateRandomString(20)
    },
    phone: String,
    avatar: String,
    description: String,
    status: {
        type: String,
        default: "active"
    },
    statusOnline: String,
    requestFriendsList: Array,
    acceptFriendsList: Array,
    friendList: [
        {
            user_id: String,
            room_chat_id: String
        }
    ],
    deleted: {
        type: Boolean,
        default: false
    },
    deleteAt: Date
}, { timestamps: true });

const User = mongoose.model("user", userSchema, "user");

module.exports = User;