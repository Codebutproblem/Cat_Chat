const mongoose = require("mongoose");
const strangerSchema = new mongoose.Schema({
    user_id: String,
}, { timestamps: true });

const Stranger = mongoose.model("stranger", strangerSchema, "stranger-chat");

module.exports = Stranger;