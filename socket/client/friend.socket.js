const User = require("../../models/user.model");
const Roomchat = require("../../models/room-chat.model");
module.exports = (res) => {
    _io.once("connection", (socket) => {
        socket.on("CLIENT_ADD_FRIEND", async (idB) => {
            const idA = res.locals.user.id;
            const existAinB = await User.findOne({
                _id: idB,
                acceptFriendsList: idA
            });
            if (!existAinB) {
                await User.updateOne({
                    _id: idB
                }, {
                    $push: { acceptFriendsList: idA }
                });
            }
            const existBinA = await User.findOne({
                _id: idA,
                requestFriendsList: idB
            });

            if (!existBinA) {
                await User.updateOne({
                    _id: idA
                }, {
                    $push: { requestFriendsList: idB }
                });
            }

            if(!existAinB && !existAinB){
                const userA = await User.findOne({
                    _id: idA,
                    deleted: false
                });
                const userB = await User.findOne({
                    _id: idB,
                    deleted: false
                });
                socket.broadcast.emit("RECIEVE_REQUEST_FRIEND",{
                    userA: userA,
                    userB: userB,
                    countRequestFriend: userB.acceptFriendsList.length
                });
            }
        });

        socket.on("CLIENT_CANCEL_ADD_FRIEND", async (idB) => {
            const idA = res.locals.user.id;

            const existAinB = await User.findOne({
                _id: idB,
                acceptFriendsList: idA
            });
            if (existAinB) {
                await User.updateOne({
                    _id: idB
                }, {
                    $pull: { acceptFriendsList: idA }
                });
            }
            const existBinA = await User.findOne({
                _id: idA,
                requestFriendsList: idB
            });

            if (existBinA) {
                await User.updateOne({
                    _id: idA
                }, {
                    $pull: { requestFriendsList: idB }
                });
            }
        });

        socket.on("CLIENT_REFUSE_ADD_FRIEND", async (idB) => {
            const idA = res.locals.user.id;

            const existAinB = await User.findOne({
                _id: idB,
                requestFriendsList: idA
            });
            if (existAinB) {
                await User.updateOne({
                    _id: idB
                }, {
                    $pull: { requestFriendsList: idA }
                });
            }
            const existBinA = await User.findOne({
                _id: idA,
                acceptFriendsList: idB
            });

            if (existBinA) {
                await User.updateOne({
                    _id: idA
                }, {
                    $pull: { acceptFriendsList: idB }
                });
            }

            if(existAinB && existBinA){
                const userA = await User.findOne({
                    _id: idA,
                    deleted: false
                });
                const userB = await User.findOne({
                    _id: idB,
                    deleted: false
                });
                socket.broadcast.emit("REFUSE_ADD_FRIEND",{
                    userA: userA,
                    userB: userB,
                });
            }
        });

        socket.on("CLIENT_ACCEPT_ADD_FRIEND", async (idB) => {
            const idA = res.locals.user.id;
            const dataRoom = {
                typeRoom: "friend",
                users: [
                    {
                        user_id: idA,
                        role: "superAdmin"
                    },
                    {
                        user_id: idB,
                        role: "superAdmin"
                    }
                ]
            }

            const roomchat = new Roomchat(dataRoom);
            await roomchat.save();
            const existAinB = await User.findOne({
                _id: idB,
                "friendList.user_id": idA
            });
            if (!existAinB) {
                await User.updateOne({
                    _id: idB
                }, {
                    $push: {
                        friendList: {
                            user_id: idA,
                            room_chat_id: roomchat.id
                        }
                    },
                    $pull: { 
                        requestFriendsList: idA,
                        acceptFriendsList: idA 
                    }
                });
            }
            const existBinA = await User.findOne({
                _id: idA,
                "friendList.user_id": idB
            });

            if (!existBinA) {
                await User.updateOne({
                    _id: idA
                }, {
                    $push: {
                        friendList: {
                            user_id: idB,
                            room_chat_id: roomchat.id
                        }
                    },
                    $pull: { 
                        acceptFriendsList: idB,
                        requestFriendsList: idB 
                    }
                });
            }
            if(!existAinB && !existBinA){
                const userA = await User.findOne({
                    _id: idA,
                    deleted: false
                });
                const userB = await User.findOne({
                    _id: idB,
                    deleted: false
                });
                socket.broadcast.emit("ACCEPT_ADD_FRIEND",{
                    userA: userA,
                    userB: userB,
                });
            }
        });

        socket.on("CLIENT_UNFRIEND", async (idB) => {
            const idA = res.locals.user.id;

            const userA = await User.findOne({
                _id: idA
            });
            const friend= userA.friendList.find(friend => friend.user_id == idB);
            if(!friend){
                return;
            }
            
            const room_id = friend.room_chat_id;

            await Roomchat.deleteOne({
                _id: room_id
            });

            const existAinB = await User.findOne({
                _id: idB,
                "friendList.user_id": idA
            });
            if (existAinB) {
                await User.updateOne({ _id: idB }, {
                    $pull: { friendList: { user_id: idA, room_chat_id: room_id } }
                });
            }
            const existBinA = await User.findOne({
                _id: idA,
                "friendList.user_id": idB
            });

            if (existBinA) {
                await User.updateOne({ _id: idA }, {
                    $pull: { friendList: { user_id: idB, room_chat_id: room_id } }
                });
            }
        });
    });
}