const Chat = require("../../models/chat.model");
const User = require("../../models/user.model");
const Roomchat = require("../../models/room-chat.model");
const Stranger = require("../../models/stranger.model");
const Format = require("../../helpers/format");
const chatSocket = require("../../socket/client/chat.socket");
const Pair = require("../../helpers/pair");
module.exports.index = async (req, res) => {
    const room_id = req.params.room_id;
    const idA = res.locals.user.id;
    chatSocket(res, room_id, "friend");
    const chats = await Chat.find({
        room_chat_id: room_id,
        deleted: false
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
    }
    res.render("client/pages/chat/index", {
        pageTitle: "Cat Chat",
        chats: chats,
        friend: userB
    });
}

module.exports.stranger = async (req, res) => {
    res.render("client/pages/chat/stranger", {
        pageTitle: "Cat Chat"
    });
}
module.exports.inQueue = async (req, res) => {
    const idA = res.locals.user.id;
    const isAinQueue = await Stranger.findOne({ user_id: idA });
    if (!isAinQueue) {
        const stranger = new Stranger({ user_id: idA });
        await stranger.save();
        const idB = await Pair(idA);
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
            _io.once("connection", (socket)=>{
                _io.emit("FOUND_STRANGER", roomchat.id);
            });
        }
        _io.once("connection", (socket)=>{
            socket.on("JOIN_ROOM", async (room_id)=>{
                const roomchat = await Roomchat.findOne({_id: room_id});
                for(const user of roomchat.users){
                    await Stranger.deleteOne({user_id: user.user_id});
                }
                const user_1 = await User.findOne({_id: roomchat.users[0].user_id}).select("-password -tokenUser");
                const user_2 = await User.findOne({_id: roomchat.users[1].user_id}).select("-password -tokenUser");
                socket.emit("JOIN_NOW", {
                    room_id: room_id,
                    user_1: user_1,
                    user_2: user_2
                });
            });
            socket.on("LEAVE_QUEUE", async (userId)=>{
                await Roomchat.deleteOne({
                    "users.user_id": userId
                });
            });
        })
        res.render("client/pages/chat/in-queue",{
            pageTitle: "Loading..."
        });
    }
    else {
        await Stranger.deleteOne({user_id: idA});
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