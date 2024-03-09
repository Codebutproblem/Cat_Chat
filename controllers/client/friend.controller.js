const User = require("../../models/user.model");
const friendSocket = require("../../socket/client/friend.socket");
module.exports.addFriend = async (req, res) => {

    friendSocket(res);

    const thisUser = res.locals.user;
    let find = {
        _id : {$ne: thisUser.id},
        status: "active",
        deleted: false
    }
    if(req.query.keyword){
        find.fullName = new RegExp(req.query.keyword,"i");
    }

    const users = await User.find(find).select("-tokenUser -password");
    for(const user of users){
        let classBtn = "add";
        if(thisUser.requestFriendsList.includes(user.id)){
            classBtn = "cancel";
        }
        if(thisUser.acceptFriendsList.includes(user.id)){
            classBtn = "accept";
        }
        if(thisUser.friendList.find((friend) => friend.user_id == user.id)){
            classBtn = "unfriend";
            
        }
        user.classBtn = classBtn;
    }
    res.render("client/pages/friend/add",{
        pageTitle: "Kết bạn",
        users: users
    });
}

module.exports.acceptFriend = async (req, res) => {

    friendSocket(res);

    const thisUser = res.locals.user;
    let find = {
        _id : {$ne: thisUser.id},
        status: "active",
        deleted: false,
        requestFriendsList: thisUser.id
    }
    if(req.query.keyword){
        find.fullName = new RegExp(req.query.keyword,"i");
    }

    const users = await User.find(find).select("-tokenUser -password");
    res.render("client/pages/friend/accept",{
        pageTitle: "Kết bạn",
        users: users
    });
}

module.exports.friend = async (req, res) => {
    friendSocket(res);
    const thisUser = res.locals.user;
    let find = {
        _id : {$ne: thisUser.id},
        status: "active",
        deleted: false,
        'friendList.user_id': thisUser.id
    }
    if(req.query.keyword){
        find.fullName = new RegExp(req.query.keyword,"i");
    }
    const users = await User.find(find).select("-tokenUser -password");
    for(const user of users){
        const me = user.friendList.find((friend)=> friend.user_id == thisUser.id);
        if(me){
            user.our_room_id = me.room_chat_id;
        } 
    }
    res.render("client/pages/friend/list-friend",{
        pageTitle: "Kết bạn",
        users: users
    });
}
