const Chat = require("../../models/chat.model");
const User = require("../../models/user.model");
const Roomchat = require("../../models/room-chat.model");
const Format = require("../../helpers/format");
const chatSocket = require("../../socket/client/chat.socket");
module.exports.index = async (req, res) => {
    const room_id = req.params.room_id;
    const idA = res.locals.user.id;
    // await Chat.deleteMany({});
    chatSocket(res, room_id);
    const chats = await Chat.find({
        room_chat_id: room_id,
        deleted: false
    });
    
    const roomchat = await Roomchat.findOne({
        _id: room_id,
        deleted: false
    });
    if(!roomchat){
        res.redirect("back");
        return;
    }
    const idB = roomchat.users.find(user => user.user_id != idA).user_id;
    const userB = await User.findOne({
        _id: idB
    }).select("-password -tokenUser");
    for(const chat of chats){
        const infoUser = await User.findOne({
            _id: chat.user_id
        });
        chat.timeDisplay = Format.formatDateTime(chat.sendAt);
        chat.infoUser = infoUser;
    }
    res.render("client/pages/chat/index", {
        pageTitle: "Cat Chat",
        chats: chats,
        friend: userB
    });
}