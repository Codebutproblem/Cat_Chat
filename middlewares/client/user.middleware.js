const User = require("../../models/user.model");
const onlineSocket = require("../../socket/client/online.socket");
module.exports.getUser = async (req, res, next) => {
    if(req.cookies.tokenUser){ 
        const user = await User.findOne({
            tokenUser: req.cookies.tokenUser,
            deleted: false,
            status: "active"
        }).select("-password");
        if(user){
            await onlineSocket.online(user.id, "online");
            onlineSocket.close(user.id);
            res.locals.user = user;
        }
    }
    next();
}

module.exports.autoLogin = async (req, res, next) => {
    if(req.cookies.tokenUser){ 
        const user = await User.findOne({
            tokenUser: req.cookies.tokenUser,
            deleted: false,
            status: "active"
        });
        if(user){
            res.redirect("/chat");
            return;
        }
    }
    next();
}