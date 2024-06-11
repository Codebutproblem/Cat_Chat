const Post = require("../../models/post.model");
const Format = require("../../helpers/format");
module.exports.index = async (req, res) => {

    const posts = await Post.find({deleted: false}).sort({position: "desc"});
    for(const post of posts){
        post.createdAtStr = Format.formatDate(post.createdAt);
    }

    res.render("client/pages/home/index",{
        pageTitle: "Home",
        page:"home",
        posts: posts
    });
}