const Roomchat = require("../../models/room-chat.model");
const User = require("../../models/user.model");
const Stranger = require("../../models/stranger.model");
module.exports = (userId, room_id) => {
    _io.once("connection", (socket)=>{
        if(room_id){
            _io.emit("FOUND_STRANGER", room_id);
        }
        
        socket.on("JOIN_ROOM", async (data)=>{
            if(userId == data.user_id){
                socket.join(data.room_id);
                const roomchat = await Roomchat.findOne({_id: data.room_id});
                for(const user of roomchat.users){
                    await Stranger.deleteOne({user_id: user.user_id});
                }
                const user_1 = await User.findOne({_id: roomchat.users[0].user_id}).select("-password -tokenUser");
                const user_2 = await User.findOne({_id: roomchat.users[1].user_id}).select("-password -tokenUser");
                socket.emit("JOIN_NOW", {
                    room_id: data.room_id,
                    user_1: user_1,
                    user_2: user_2
                });
            }
        });
        socket.on("LEAVE_QUEUE", async (data)=>{
            await Stranger.deleteMany({
                user_id: data.userId
            });
            if(data.room_id){
                await Roomchat.deleteMany({
                    typeRoom: "temporary",
                    "users.user_id": data.userId
                });
                socket.broadcast.to(data.room_id).emit("MAKE_CLIENT_LEAVE_QUEUE");
            }
        });
    });
}