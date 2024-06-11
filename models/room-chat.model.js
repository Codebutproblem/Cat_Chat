const mongoose = require("mongoose");
const roomchatSchema = new mongoose.Schema({
    title: String,
    avatar: String,
    typeRoom: String,
    users : [
        {
            user_id: String,
            role: String
        }
    ],
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, { timestamps: true });

const Roomchat = mongoose.model("Roomchat", roomchatSchema, "room-chat");

module.exports = Roomchat;