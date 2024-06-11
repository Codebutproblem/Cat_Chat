const Post = require("../../models/post.model");
const Format = require("../../helpers/format");
const Account = require("../../models/account.model");
module.exports.index = async (req,res) =>{

    let find = {
        deleted: false
    }

    const posts = await Post.find(find).sort({position: "desc"});
    for(const post of posts){
        post.createdAtStr = Format.formatDate(post.createdAt);
        if(post.account_id != "none"){
            const account = await Account.findOne({_id: post.account_id});
            post.creator = account.fullName;
        }
    }
    res.render("admin/pages/post/index",{
        pageTitle: "Post Page",
        posts: posts
    });
}

module.exports.create = (req,res) =>{
    res.render("admin/pages/post/create",{
        pageTitle: "Create Post"
    });
}
module.exports.createPost = async (req,res) =>{
    const totalPost = await Post.countDocuments({});
    const {title,content} = req.body;
    const account_id = res.locals.account.id;
    const newPost = new Post({
        account_id: account_id,
        title: title,
        content: content,
        position: totalPost + 1
    });
    await newPost.save();
    res.redirect("/admin/posts");
}

module.exports.delete = async (req,res) =>{
    const postId = req.params.id;
    await Post.updateOne({_id: postId},{deleted: true});
    res.redirect("back");
};

module.exports.edit = async (req,res) =>{
    const postId = req.params.id;
    const post = await Post.findOne({_id: postId});
    res.render("admin/pages/post/edit",{
        pageTitle: "Edit Post",
        post: post
    });
}

module.exports.editPost = async (req,res) =>{
    const postId = req.params.id;
    const {title,content} = req.body;
    await Post.updateOne({_id: postId},{title: title,content: content});
    res.redirect("/admin/posts");
}