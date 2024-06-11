const md5 = require("md5");
const Account = require("../../models/account.model");
module.exports.login = (req,res) =>{
    res.render("admin/pages/auth/login",{
        pageTitle: "Login"
    });
}

module.exports.loginPost = async (req,res) =>{
    const email = req.body.email;
    const password = req.body.password;
    const account = await Account.findOne({email: email});
    if(!account){
        res.redirect("back");
        return;
    }
    if(account.password !== md5(password)){
        res.redirect("back");
        return;
    }
    res.cookie("tokenAdmin", account.tokenAdmin);
    res.redirect("/admin/home");
}

module.exports.logout = (req,res) =>{
    res.clearCookie("tokenAdmin");
    res.redirect("/admin/auth/login");
}