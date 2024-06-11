const User = require("../../models/user.model");
const friendSocket = require("../../socket/client/friend.socket");
const paginationHelper = require("../../helpers/pagination");
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
    const totalItem = await User.countDocuments(find);
    let paginationObject = paginationHelper(1, 6, req.query, totalItem);
    paginationObject.totalItem = totalItem;

    const users = (await User.find(find).limit(paginationObject.limitItem).skip(paginationObject.skip).select("-tokenUser -password"));
    users.reverse();
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
        users: users,
        page:"add",
        pagination: paginationObject
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

    const totalItem = await User.countDocuments(find);
    let paginationObject = paginationHelper(1, 6, req.query, totalItem);
    paginationObject.totalItem = totalItem;

    const users = await User.find(find).limit(paginationObject.limitItem).skip(paginationObject.skip).select("-tokenUser -password");
    res.render("client/pages/friend/accept",{
        pageTitle: "Kết bạn",
        users: users,
        page: "accept",
        pagination: paginationObject
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

    const totalItem = await User.countDocuments(find);
    let paginationObject = paginationHelper(1, 6, req.query, totalItem);
    paginationObject.totalItem = totalItem;

    const users = await User.find(find).limit(paginationObject.limitItem).skip(paginationObject.skip).select("-tokenUser -password");
    users.sort((user1,user2)=>{
        return user1.fullName.localeCompare(user2.fullName);
    });
    for(const user of users){
        const me = user.friendList.find((friend)=> friend.user_id == thisUser.id);
        if(me){
            user.our_room_id = me.room_chat_id;
        } 
    }
    res.render("client/pages/friend/list-friend",{
        pageTitle: "Kết bạn",
        users: users,
        page:"friend-list",
        pagination: paginationObject
    });
}
