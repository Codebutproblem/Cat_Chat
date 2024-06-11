const Verification = require("../../models/verification.model");
const User = require("../../models/user.model");
const generate = require("../../helpers/generate");
const mail = require("../../helpers/mail");
const md5 = require("md5");
const onlineSocket = require("../../socket/client/online.socket");
const uploadCloud = require("../../helpers/uploadCloud");
module.exports.login = (req, res) => {
    let rememberUser = {
        remember: false
    };
    if(req.cookies.remember_user){
        rememberUser.remember = true;
        const user = JSON.parse(req.cookies.remember_user);
        rememberUser.email = user.email;
        rememberUser.password = user.password;
    }
    res.render("client/pages/user/login", {
        pageTitle: "Đăng nhập",
        rememberUser: rememberUser
    });
}

module.exports.loginPost = async (req, res) => {
    const email = req.body.email;
    const password = md5(req.body.password);
    if(req.body.remember){
        const timeExist = 365*24*60*60*1000;
        res.cookie(
            "remember_user",
            JSON.stringify({email:email, password: req.body.password}), 
            {expires: new Date(Date.now() + timeExist)}    
        );
    }
    else{
        res.clearCookie("remember_user");
    }
    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if (!user) {
        req.flash("error", "Tài khoản không tồn tại");
        res.redirect("back");
        return;
    }
    if (user.password != password) {
        req.flash("error", "Mật khẩu không đúng");
        res.redirect("back");
        return;
    }
    if (user.status == "inactive") {
        req.flash("error", "Tài khoản đã bị khóa");
        res.redirect("back");
        return;
    }
    res.cookie("tokenUser", user.tokenUser);
    req.flash("success", `Đăng nhập thành công! Xin chào ${user.fullName}.`);
    res.redirect("/");
}

module.exports.logout = async (req, res) => {
    await User.updateOne({
        tokenUser: req.cookies.tokenUser
    },{
        statusOnline: "offline"      
    });
    onlineSocket.online(res.locals.user.id, "offline");
    res.clearCookie("tokenUser");
    req.flash("success", "Bạn đã đăng xuất");
    res.redirect("/");
}

module.exports.register = (req, res) => {
    res.render("client/pages/user/register", {
        pageTitle: "Đăng ký"
    });
}

module.exports.registerPost = async (req, res) => {
    const fullName = req.body.fullName;
    const email = req.body.email;
    const password = md5(req.body.password);
    const gender = req.body.gender;
    const avatar = gender == "male" ? "/client/images/male-default.png" : "/client/images/female-default.png"

    const emailExist = await User.findOne({
        email: email,
        deleted: false
    });

    if (emailExist) {
        req.flash("error", "Email đã tồn tại trước đó");
        res.redirect("back");
        return;
    }

    const userInfo = {
        fullName: fullName,
        email: email,
        password: password,
        gender: gender,
        avatar: avatar
    }


    await Verification.deleteOne({ email: email });

    const verification = new Verification({
        email: email,
        otp: generate.generateRandomNumber(8),
        expireAt: Date.now()
    });

    await verification.save();
    // Send OTP
    const subject = "Mã xác minh từ Cat Chat";
    const html = `Mã xác minh của bạn là: <b>${verification.otp}</b>`
    mail.send(email, subject, html);

    res.cookie("userInfo", JSON.stringify(userInfo));
    res.redirect("/user/verification");
}

module.exports.verification = (req, res) => {
    const userInfo = JSON.parse(req.cookies.userInfo);
    res.render("client/pages/user/verification", {
        pageTitle: "Xác minh tài khoản",
        email: userInfo.email
    });
}

module.exports.verificationPost = async (req, res) => {
    const userInfo = JSON.parse(req.cookies.userInfo);
    const result = await Verification.findOne({
        email: userInfo.email,
        otp: req.body.otp
    });
    if (!result) {
        req.flash("error", "Mã xác minh không đúng");
        res.redirect("back");
        return;
    }
    const user = new User(userInfo);
    await user.save();
    res.clearCookie("userInfo");
    res.cookie("tokenUser", user.tokenUser);
    req.flash("success", `Đăng ký thành công! Xin chào ${userInfo.fullName}.`);
    res.redirect("/");
}

module.exports.forgot = (req, res) => {
    res.render("client/pages/user/forgot", {
        pageTitle: "Quên mật khẩu"
    });
}

module.exports.forgotPost = async (req, res) => {
    const email = req.body.email;

    const emailExist = await User.findOne({
        email: email,
        deleted: false
    });
    if (!emailExist) {
        req.flash("error", "Email không tồn tại !");
        res.redirect("back");
        return;
    }
    await Verification.deleteOne({ email: email });
    const verification = new Verification({
        email: email,
        otp: generate.generateRandomNumber(8),
        expireAt: Date.now()
    });
    await verification.save();


    const subject = "Mã xác minh từ Cat Chat";
    const html = `Mã xác minh của bạn là: <b>${verification.otp}</b>`
    mail.send(email, subject, html);
    res.redirect(`/user/password/forgot-verify?email=${email}`);
}

module.exports.forgotVerify = (req, res) => {
    const email = req.query.email;
    res.render("client/pages/user/forgot-verify", {
        pageTitle: "Xác minh tài khoản",
        email: email
    });
}

module.exports.forgotVerifyPost = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;
    const result = await Verification.findOne({
        email: email,
        otp: otp
    });

    if (!result) {
        req.flash("error", "Mã xác minh không đúng");
        res.redirect("back");
        return;
    }
    const user = await User.findOne({
        email: email,
        deleted: false,
    });
    res.cookie("tokenUser", user.tokenUser);
    req.flash("success", "Xác minh thành công");
    res.redirect("/user/password/reset");
}

module.exports.reset = (req, res) => {
    res.render("client/pages/user/reset", {
        pageTitle: "Đổi mật khẩu"
    });
}

module.exports.resetPatch = async (req, res) => {
    const tokenUser = req.cookies.tokenUser;
    const password = req.body.password;
    try {
        const user = await User.findOne({ tokenUser: tokenUser });
        await User.updateOne({ tokenUser: tokenUser }, {
            password: md5(password)
        });
        req.flash("success", "Đổi mật khẩu thành công");
        res.redirect("/");
    }
    catch (error) {
        req.flash("error", "Đổi mật khẩu không thành công");
        res.redirect("back");
    }
}

module.exports.sendOtpAgain = async (req, res) => {
    const email = req.params.email;
    await Verification.deleteOne({ email: email });
    const verification = new Verification({
        email: email,
        otp: generate.generateRandomNumber(8),
        expireAt: Date.now()
    });
    await verification.save();


    const subject = "Mã xác minh từ Cat Chat";
    const html = `Mã xác minh của bạn là: <b>${verification.otp}</b>`
    mail.send(email, subject, html);
    res.redirect("back");
}
module.exports.changePassword = async (req, res) =>{
    res.render("client/pages/user/change-password",{
        pageTitle: "Thay đổi mật khẩu"
    });
}
module.exports.changePasswordPatch = async (req, res) =>{
    try{
        const newPassword = req.body.newPassword;
        const tokenUser = req.cookies.tokenUser;
        await User.updateOne({
            tokenUser: tokenUser
        },{password: md5(newPassword)});
        req.flash("success","Thay đổi mật khẩu thành công");
        res.redirect("/");
    }catch(error){
        req.flash("error","Thay đổi mật khẩu thất bại");
        res.redirect("back");
    }
}
module.exports.updateInfo = async (req, res)=>{
    try {
        const fullName = req.body.fullName;
        const phone = req.body.phone;
        const gender = req.body.gender;
        const description = req.body.description;
        const tokenUser = req.cookies.tokenUser;
        if(req.file){
            const url = await uploadCloud(req.file.buffer);
            await User.updateOne({tokenUser: tokenUser},{
                fullName: fullName,
                phone: phone,
                gender: gender,
                description: description,
                avatar: url
            });
        }
        else{
            await User.updateOne({tokenUser: tokenUser},{
                fullName: fullName,
                gender: gender,
                phone: phone,
                description: description
            });
        }
        req.flash("success","Cập nhật thành công");
        res.redirect("/");
    } catch (error) {
        console.log(error);
        req.flash("error", "Cập nhật không thành công");
        res.redirect("back");
    }
}
