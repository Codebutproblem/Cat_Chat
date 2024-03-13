const uploadCloud = require("../../helpers/uploadCloud");
const Chat = require("../../models/chat.model");
const Chatroom = require("../../models/room-chat.model");
module.exports = (res, room_id, typeRoom) => {
    const user = res.locals.user;
    _io.once("connection", (socket) => {
        socket.join(room_id);
        socket.on("CLIENT_SEND_MESSAGE", async (data) => {
            let images = [];            
            if (typeRoom == "friend") {
                for (const imageBuffer of data.images) {
                    const link = await uploadCloud(imageBuffer);
                    images.push(link);
                }
                const chat = new Chat({
                    user_id: user.id,
                    content: data.content,
                    images: images,
                    room_chat_id: room_id,
                    sendAt: new Date()
                });
                await chat.save();
            }
            if(typeRoom == "temporary"){
                for (const imageBuffer of data.images) {
                    console.log(typeof imageBuffer)
                    // images.push(link);
                }
            }
            _io.to(room_id).emit("SERVER_RETURN_MESSAGE", {
                fullName: user.fullName,
                userId: user.id,
                avatar: user.avatar,
                gender: user.gender,
                content: data.content,
                images: images
            });
        });

        if(typeRoom == "temporary"){
            socket.on("CLIENT_LEAVE_ROOM", async (room_id)=>{
                await Chatroom.deleteOne({_id: room_id});
                socket.broadcast.to(room_id).emit("SERVER_MAKE_CLIENT_LEAVE");
            });
        }

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