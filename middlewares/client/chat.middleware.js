const Roomchat = require("../../models/room-chat.model");

module.exports.isJoin = async (req, res, next) =>{
    const room_id = req.params.room_id;
    const userId = res.locals.user.id;
    const userInRoom = await Roomchat.findOne({
        _id: room_id,
        "users.user_id": userId,
        deleted: false
    });
    if(!userInRoom){
        res.redirect("back");
        return;
    }
    next();
}