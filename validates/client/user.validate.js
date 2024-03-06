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

