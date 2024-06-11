const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
    account_id: String,
    title: String,
    content: String,
    deleted: {
        type: Boolean,
        default: false
    },
    position: Number,
    deletedAt: Date
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema, "post");

module.exports = Post;