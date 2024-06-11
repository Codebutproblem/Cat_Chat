const User = require("../../models/user.model");
const Report = require("../../models/report.model");
const paginationHelper = require("../../helpers/pagination");
module.exports.index = async (req,res) =>{
    let find={
        deleted: false
    };
    
    if(req.query.keyword){
        find.fullName = new RegExp(req.query.keyword,"i");
    }
    
    const totalItem = await User.countDocuments(find);
    let paginationObject = paginationHelper(1, 4, req.query, totalItem);
    paginationObject.totalItem = totalItem;

    const users = await User.find(find).limit(paginationObject.limitItem).skip(paginationObject.skip).select("-password -token");
    for(const user of users){
        const report = await Report.findOne({user_id: user.id});
        if(report){
            user.totalReport = report.report_users.length;
        }
        else{
            user.totalReport = 0;
        }
    }
    users.sort((a,b) => a.fullName.localeCompare(b.fullName));
    if(req.query.type_sort){
        switch(req.query.type_sort){
            case "totalReport-asc":
                users.sort((a,b) => a.totalReport - b.totalReport);
                break;
            case "totalReport-desc":
                users.sort((a,b) => b.totalReport - a.totalReport);
                break;
            case "fullName-asc":
                users.sort((a,b) => a.fullName.localeCompare(b.fullName));
                break;
            case "fullName-desc":
                users.sort((a,b) => b.fullName.localeCompare(a.fullName));
                break;
            default:
                break;
        }
    }
    res.render("admin/pages/user/index",{
        pageTitle: "User Page",
        users: users,
        pagination: paginationObject
    });
}

module.exports.lock = async (req,res) =>{
    const userId = req.params.id;
    const user = await User.findOne({_id: userId});
    if(user.status === "inactive"){
        await User.updateOne({_id: userId},{status: "active"});
    }
    else{
        await User.updateOne({_id: userId},{status: "inactive"});
    }
    res.redirect("back");
};

module.exports.delete = async (req,res) =>{
    const userId = req.params.id;
    await User.updateOne({_id: userId},{deleted: true, deletedAt: Date.now()});
    res.redirect("back");
}