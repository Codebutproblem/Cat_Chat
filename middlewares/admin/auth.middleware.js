const Account = require("../../models/account.model");
module.exports.requireAuth = async (req,res,next) =>{
    if(!req.cookies.tokenAdmin){
        res.redirect("/admin/auth/login");
    }
    else{
        const account = await Account.findOne({tokenAdmin: req.cookies.tokenAdmin}).select("-password");
        if(!account){
            res.redirect("/admin/auth/login");
        }
        else{
            res.locals.account = account;
            next();
        }
    }
}