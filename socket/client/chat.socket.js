const uploadCloud = require("../../helpers/uploadCloud");
const Chat = require("../../models/chat.model");
module.exports = (res, room_id) => {
    const user = res.locals.user;
    _io.once("connection", (socket) => {
        socket.join(room_id);
        socket.on("CLIENT_SEND_MESSAGE", async (data) => {

            let images = [];

            for (const imageBuffer of data.images) {
                const link = await uploadCloud(imageBuffer);
                images.push(link);
            }
            _io.to(room_id).emit("SERVER_RETURN_MESSAGE", {
                fullName: user.fullName,
                userId: user.id,
                avatar: user.avatar,
                gender: user.gender,
                content: data.content,
                images: images
            });

            const chat = new Chat({
                user_id: user.id,
                content: data.content,
                images: images,
                room_chat_id: room_id,
                sendAt: new Date()
            });
            await chat.save();
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