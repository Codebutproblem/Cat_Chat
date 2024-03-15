const User = require("../../models/user.model");
const md5 = require("md5");
module.exports.registerCheckForm = (req, res, next) => {
    if(!req.body.fullName){
        req.flash("error", "Bạn chưa nhập họ tên");
        res.redirect("back");
        return;
    }
    if(!req.body.email){
        req.flash("error", "Bạn chưa nhập email");
        res.redirect("back");
        return;
    }
    if(!req.body.email.includes("@")){
        req.flash("error", "Định dạng email không đúng");
        res.redirect("back");
        return;
    }
    if(!req.body.password){
        req.flash("error", "Bạn chưa nhập mật khẩu");
        res.redirect("back");
        return;
    }
    next();
}
module.exports.loginCheckForm = (req, res, next) => {
    if(!req.body.email){
        req.flash("error", "Bạn chưa nhập email");
        res.redirect("back");
        return;
    }
    if(!req.body.email.includes("@")){
        req.flash("error", "Định dạng email không đúng");
        res.redirect("back");
        return;
    }
    if(!req.body.password){
        req.flash("error", "Bạn chưa nhập mật khẩu");
        res.redirect("back");
        return;
    }
    next();
}

module.exports.emailForgotCheck = (req, res, next) =>{
    if(!req.body.email){
        req.flash("error", "Bạn chưa nhập email");
        res.redirect("back");
        return;
    }
    if(!req.body.email.includes("@")){
        req.flash("error", "Định dạng email không đúng");
        res.redirect("back");
        return;
    }
    next();
}


module.exports.resetPasswordCheck = (req, res, next) =>{
    const password = req.body.password;
    const passwordConfirm = req.body.password_confirm;
    if(!password){
        req.flash("error","Vui lòng nhập mật khẩu");
        res.redirect("back");
        return;
    }
    if(!passwordConfirm){
        req.flash("error","Vui lòng xác thực mật khẩu");
        res.redirect("back");
        return;
    }
    if(password != passwordConfirm){
        req.flash("error","Xác minh mật khẩu không đúng");
        res.redirect("back");
        return;
    }
    next();
}

module.exports.changePasswordCheck = async (req, res, next) =>{
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const newPasswordConfirm = req.body.newPassword_confirm;
    if(!oldPassword){
        req.flash("error","Vui lòng nhập mật khẩu");
        res.redirect("back");
        return;
    }
    if(!newPassword){
        req.flash("error","Vui lòng nhập mật khẩu mới");
        res.redirect("back");
        return;
    }
    if(!newPasswordConfirm){
        req.flash("error","Vui lòng xác minh mật khẩu mới");
        res.redirect("back");
        return;
    }
    const tokenUser = req.cookies.tokenUser;
    const user = await User.findOne({tokenUser: tokenUser});
    if(md5(oldPassword) != user.password){
        req.flash("error","Mật khẩu cũ không đúng");
        res.redirect("back");
        return;
    }
    if(newPassword != newPasswordConfirm){
        req.flash("error","Xác nhận mật khẩu không đúng");
        res.redirect("back");
        return;
    }
    next();
}



