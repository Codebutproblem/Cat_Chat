const Chat = require("../../models/chat.model");
const User = require("../../models/user.model");
const Roomchat = require("../../models/room-chat.model");
const Stranger = require("../../models/stranger.model");
const Format = require("../../helpers/format");
const chatSocket = require("../../socket/client/chat.socket");
const Pair = require("../../helpers/pair");
const pairSocket = require("../../socket/client/pair.socket");
module.exports.index = async (req, res) => {
    const room_id = req.params.room_id;
    const idA = res.locals.user.id;
    chatSocket(res, room_id, "friend");
    const chats = await Chat.find({
        room_chat_id: room_id
    });

    const roomchat = await Roomchat.findOne({
        _id: room_id,
        deleted: false
    });
    if (!roomchat) {
        res.redirect("back");
        return;
    }
    const idB = roomchat.users.find(user => user.user_id != idA).user_id;
    const userB = await User.findOne({
        _id: idB
    }).select("-password -tokenUser");
    for (const chat of chats) {
        const infoUser = await User.findOne({
            _id: chat.user_id
        });
        chat.timeDisplay = Format.formatDateTime(chat.sendAt);
        chat.infoUser = infoUser;

        
        if(chat.answer_id){
            const answerChat = await Chat.findOne({
                _id: chat.answer_id
            });
            if(answerChat){
                chat.answerChat = answerChat;
            }
        }
    }
    res.render("client/pages/chat/index", {
        pageTitle: "Cat Chat",
        chats: chats,
        friend: userB
    });
}

module.exports.stranger = async (req, res) => {
    res.render("client/pages/chat/stranger", {
        pageTitle: "Cat Chat",
        page: "quick-chat"
    });
}
module.exports.inQueue = async (req, res) => {
    const idA = res.locals.user.id;
    const isAinQueue = await Stranger.findOne({ user_id: idA });
    if (!isAinQueue) {
        const stranger = new Stranger({ user_id: idA });
        await stranger.save();
        const idB = await Pair(idA);
        let room_id = "";
        if(idB){
            const roomchat = new Roomchat({
                typeRoom: "temporary",
                users:[
                    {
                        user_id: idA,
                        role: "superAdmin"
                    },
                    {
                        user_id: idB,
                        role: "superAdmin"
                    }
                ]
            });
            await roomchat.save();
            room_id = roomchat.id;
        }
        pairSocket(idA, room_id);
        res.render("client/pages/chat/in-queue",{
            pageTitle: "Loading..."
        });
    }
    else {
        await Stranger.deleteMany({user_id: idA});
        res.redirect("/chat/stranger");
    }
}
module.exports.chatWStranger = async (req, res) => {
    const room_id = req.params.room_id;
    const idA = res.locals.user.id;
    chatSocket(res, room_id, "temporary");
    const roomchat = await Roomchat.findOne({
        _id: room_id,
        deleted: false
    });
    if (!roomchat) {
        res.redirect("/chat/stranger");
        return;
    }
    const idB = roomchat.users.find(user => user.user_id != idA).user_id;
    const userB = await User.findOne({
        _id: idB
    }).select("-password -tokenUser");
    res.render("client/pages/chat/stranger-chat", {
        pageTitle: "Cat Chat",
        stranger : userB,
        room_id: room_id
    });
}