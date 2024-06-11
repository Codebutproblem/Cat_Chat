const uploadCloud = require("../../helpers/uploadCloud");
const Chat = require("../../models/chat.model");
const Chatroom = require("../../models/room-chat.model");
const Report = require("../../models/report.model");
const generate = require("../../helpers/generate");
module.exports = (res, room_id, typeRoom) => {
    const user = res.locals.user;
    _io.once("connection", (socket) => {
        socket.join(room_id);
        socket.on("CLIENT_SEND_MESSAGE", async (data) => {
            let images = []; 
            for (const bufferImage of data.images) {
                const link = await uploadCloud(bufferImage);
                images.push(link);
            }
            let chatId = generate.generateRandomString(25);
            if (typeRoom == "friend") {
                const chat = new Chat({
                    user_id: user.id,
                    content: data.content,
                    images: images.slice(0,4),
                    room_chat_id: room_id,
                    sendAt: new Date(),
                    answer_id: data.answerId
                });
                await chat.save();
                chatId = chat.id;
            }
            _io.to(room_id).emit("SERVER_RETURN_MESSAGE", {
                fullName: user.fullName,
                userId: user.id,
                avatar: user.avatar,
                gender: user.gender,
                content: data.content,
                images: images,
                chatId: chatId,
                answerId: data.answerId
            });
        });

        if(typeRoom == "temporary"){
            socket.on("CLIENT_LEAVE_ROOM", async (room_id)=>{
                await Chatroom.deleteOne({_id: room_id});
                socket.broadcast.to(room_id).emit("SERVER_MAKE_CLIENT_LEAVE");
            });
            socket.on("CLIENT_REPORT_STRANGER", async (data)=> {
                const report = await Report.findOne({
                    user_id: data.stranger_id,
                });
                if(!report){
                    await Report.create({
                        user_id: data.stranger_id,
                        report_users: [data.user_id]
                    });
                }
                else if(!report.report_users.includes(data.user_id)){
                    await Report.updateOne({user_id: data.stranger_id},{
                        $push: {report_users: data.user_id}
                    });
                }
            });
        }
        
        socket.on("DELETE_MESSAGE", async (chatId)=>{
            if(typeRoom == "friend"){
                await Chat.updateOne({_id: chatId},{
                    deleted: true,
                    deletedAt: new Date()
                });
            }
            _io.to(room_id).emit("SERVER_RETURN_DELETE_MESSAGE",{
                chatId: chatId,
                userId: user.id
            });
        });


        socket.on("CLIENT_SEND_TYPING", (type) => {
            socket.broadcast.to(room_id).emit("SERVER_RETURN_TYPING", {
                fullName: user.fullName,
                userId: user.id,
                avatar: user.avatar,
                gender: user.gender,
                type: type
            });
        });

    });
}