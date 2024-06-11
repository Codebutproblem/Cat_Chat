const Account = require("../../models/account.model");
const md5 = require("md5");
const paginationHelper = require("../../helpers/pagination");
module.exports.index = async (req,res) =>{

    const account = res.locals.account;

    if(account.role !== "all"){
        res.redirect("back");
        return;
    }

    let find = {
        deleted: false
    }
    const totalItem = await Account.countDocuments(find);
    let paginationObject = paginationHelper(1, 6, req.query, totalItem);
    paginationObject.totalItem = totalItem;

    const accounts = await Account.find(find).limit(paginationObject.limitItem).skip(paginationObject.skip);
    res.render("admin/pages/account/index",{
        pageTitle: "Account Page",
        accounts: accounts,
        pagination: paginationObject
    });
}

module.exports.create = async (req,res) =>{
    const account = res.locals.account;
    if(account.role !== "all"){
        res.redirect("back");
        return;
    }
    res.render("admin/pages/account/create",{
        pageTitle: "Create Account"
    });
}

module.exports.createPost = async (req,res) =>{
    const account = res.locals.account;
    if(account.role !== "all"){
        res.redirect("back");
        return;
    }
    const fullName = req.body.fullName;
    const email = req.body.email;
    const password = md5(req.body.password);
    const role = req.body.role;

    const emailExist = await Account.findOne({email: email});
    if(emailExist){
        res.redirect("back");
        return;
    }
    await Account.create({
        fullName: fullName,
        email: email,
        password: password,
        role: role
    });
    res.redirect("/admin/accounts");
}

module.exports.delete = async (req,res) =>{
    const account_id = req.params.id;
    await Account.updateOne({_id: account_id},{deleted: true});
    res.redirect("back");
}
