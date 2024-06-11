const User = require("../../models/user.model");
module.exports.online = async (userId, status)=>{
    await User.updateOne({
        _id: userId
    },{
        statusOnline: status     
    });
    _io.once("connection", (socket) => {
        socket.broadcast.emit("SERVER_RETURN_STATUS",{
            userId: userId,
            status: status
        });

    });
}
module.exports.close = (userId)=>{
    _io.once("connection", (socket) => {
        socket.on("CLOSING_WEB", async (message)=>{
            await User.updateOne({
                _id: userId
            },{
                statusOnline: "offline"      
            });
            socket.broadcast.emit("SERVER_RETURN_STATUS",{
                userId: userId,
                status: "offline"
            });
        });
    });
};