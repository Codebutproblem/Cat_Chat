function updateRequestedNotification(){
    const requestedNotification = document.querySelector(".header .friend-action a span");
    const requestedCount = parseInt(requestedNotification.innerHTML);
    if(requestedCount > 1){
        requestedNotification.innerHTML = requestedCount - 1;
    }
    else{
        document.querySelector(".header .friend-action #accept-friend-nav").removeChild(requestedNotification);
    }
}

// Hàm từ chối kết bạn
function refuseListen(button){
    button.addEventListener("click",()=>{
        const refusedButton = document.querySelector(".inner-users .refused-btn");
        if(refusedButton){
            button.parentNode.classList.add("refused");
        }
        else{
            button.parentNode.classList.add("add");
        }
        button.parentNode.classList.remove("accept");
        updateRequestedNotification()
        const userId = button.parentNode.getAttribute("data-user-id");
        socket.emit("CLIENT_REFUSE_ADD_FRIEND", userId);
    });
}

// Hàm đồng ý kết bạn
function acceptListen(button){
    button.addEventListener("click", (event)=>{
        const acceptedButton = document.querySelector(".inner-users .accepted-btn");
        if(acceptedButton){
            button.parentNode.classList.add("accepted");
        }
        else{
            button.parentNode.classList.add("unfriend");
        }
        button.parentNode.classList.remove("accept");
        updateRequestedNotification()
        const userId = button.parentNode.getAttribute("data-user-id");
        socket.emit("CLIENT_ACCEPT_ADD_FRIEND", userId);
    });
}

// Hàm hủy kết bạn
function unfriendListen(button){
    button.addEventListener("click", (event)=>{
        const userId = button.parentNode.getAttribute("data-user-id");
        socket.emit("CLIENT_UNFRIEND", userId);
        const unfriendedButton = document.querySelector(".inner-users .unfriended-btn");
        if(unfriendedButton){
            button.parentNode.classList.add("unfriended");
        }
        else{
            button.parentNode.classList.add("add");
        }
        button.parentNode.classList.remove("unfriend");
    });
}

// Hàm cập nhật trạng thái

// Gửi yêu cầu kết bạn
const listBtnAdd = document.querySelectorAll(".inner-users .add-btn");
if(listBtnAdd.length > 0){
    listBtnAdd.forEach(button => {
        button.addEventListener("click", (event)=>{
            button.parentNode.classList.add("cancel");
            button.parentNode.classList.remove("add");
            const userId = button.parentNode.getAttribute("data-user-id");
            socket.emit("CLIENT_ADD_FRIEND", userId);
        });
    });
}

// Nhận yêu cầu kết bạn
const myId = document.querySelector("[user-id]").getAttribute("user-id");
socket.on("RECIEVE_REQUEST_FRIEND",(data)=>{
    console.log(data);
    const acceptFriendBox = document.querySelector(".inner-users .accept-friend-box");
    if(acceptFriendBox && myId == data.userB._id){
        const div = document.createElement("div");
        div.classList.add("col-md-4");
        div.innerHTML= `
            <div class="box-user">
                <div class="inner-avatar">
                    <img src=${data.userA.avatar} />
                </div>
                <div class="inner-info">
                    <div class="inner-name">${data.userA.fullName}</div>
                    <div class="inner-button accept" data-user-id=${data.userA._id}>
                        <button class="accept-btn btn btn-sm btn-success">Accept</button>
                        <button class="refuse-btn btn btn-sm btn-danger ms-2">Refuse</button>
                        <button class="refused-btn btn btn-sm btn-secondary" disabled>Refused</button>
                        <button class="accepted-btn btn btn-sm btn-primary" disabled>Accepted</button>
                    </div>
                </div>
            </div>
        `;
        acceptFriendBox.appendChild(div);
        const refuseBtn = div.querySelector(".box-user .inner-button .refuse-btn");
        refuseListen(refuseBtn);
        const acceptBtn = div.querySelector(".box-user .inner-button .accept-btn");
        acceptListen(acceptBtn);
    }
});

// Bị từ chối kết bạn
socket.on("REFUSE_ADD_FRIEND", (data)=>{
    const addFriendBox = document.querySelector(".inner-users .add-friend-box");
    if(addFriendBox && myId == data.userB._id){
        const boxUserA = addFriendBox.querySelector(`.box-user [data-user-id="${data.userA._id}"]`);
        boxUserA.classList.add("add");
        boxUserA.classList.remove("cancel");
    }
});
// Được đồng ý kết bạn
socket.on("ACCEPT_ADD_FRIEND", (data)=>{
    const addFriendBox = document.querySelector(".inner-users .add-friend-box");
    if(addFriendBox && myId == data.userB._id){
        const boxUserA = addFriendBox.querySelector(`.box-user [data-user-id="${data.userA._id}"]`);
        boxUserA.classList.add("unfriend");
        boxUserA.classList.remove("cancel");
    }
    const listFriendBox = document.querySelector(".inner-users .list-friend-box");
    if(listFriendBox && myId == data.userB._id){
        const div = document.createElement("div");
        div.classList.add("col-md-4");
        div.innerHTML= `
            <div class="box-user">
                <div class="inner-avatar">
                    <img src=${data.userA.avatar} />
                </div>
                <div class="inner-info">
                    <div class="inner-name">${data.userA.fullName}</div>
                    <div class="inner-button unfriend" data-user-id=${data.userA._id}>
                        <button class="unfriend-btn btn btn-sm btn-danger">Unfriend</button>
                        <button class="unfriended-btn btn btn-sm btn-secondary" disabled>Unfriend</button>
                    </div>
                </div>
                <span class=${data.userA.statusOnline == "online" ? "online" : ""} user-id="${data.userA._id}"></span>
            </div>
        `;
        listFriendBox.appendChild(div);
        const unfriendBtn = div.querySelector(".inner-button .unfriend-btn");
        unfriendListen(unfriendBtn);
    }
});

// Hủy gửi yêu cầu kết bạn
const listBtnCancel = document.querySelectorAll(".inner-users .cancel-btn");
if(listBtnCancel.length > 0){
    listBtnCancel.forEach(button => {
        button.addEventListener("click", (event)=>{
            button.parentNode.classList.add("add");
            button.parentNode.classList.remove("cancel");
            const userId = button.parentNode.getAttribute("data-user-id");
            socket.emit("CLIENT_CANCEL_ADD_FRIEND", userId);
        });
    });
}

// Từ chối kết bạn
const listBtnRefuse = document.querySelectorAll(".inner-users .refuse-btn");
if(listBtnRefuse.length > 0){
    listBtnRefuse.forEach(button => {
        refuseListen(button);
    });
}

// Đồng ý kết bạn
const listBtnAccept = document.querySelectorAll(".inner-users .accept-btn");
if(listBtnAccept.length > 0){
    listBtnAccept.forEach(button => {
        acceptListen(button);
    });
}
// Hủy kết bạn
const listBtnUnfriend = document.querySelectorAll(".inner-users .unfriend-btn");
if(listBtnUnfriend.length > 0){
    listBtnUnfriend.forEach(button => {
        unfriendListen(button);
    });
}

// Hiển thị trạng thái online của người dùng
socket.on("SERVER_RETURN_STATUS" , (data) => {
    const onlineSymbols = document.querySelectorAll(`.box-user > span`);
    for(const symbol of onlineSymbols){
        const userId = symbol.getAttribute("user-id");
        if(userId == data.userId){
            if (data.status == "online"){
                if(!symbol.classList.contains("online")){
                    symbol.classList.add("online");
                }
            }
            else{
                symbol.classList.remove("online");
            }
            break;
        }
    }
});

// Hiện thông tin người dùng khác
const boxUsers = document.querySelectorAll(".main .friend .inner-users .box-user");
if(boxUsers && boxUsers.length > 0){
    boxUsers.forEach(boxUser => {
        const innerAvatar = boxUser.querySelector(".inner-avatar");
        const innerName = boxUser.querySelector(".inner-name");
        const userId = boxUser.getAttribute("user-id");
        const boxInfoUser = document.querySelector(`.box-info-user[user-id="${userId}"]`);
        if(boxInfoUser){
            const closeButton = boxInfoUser.querySelector("[close-button]");
            const mainBox = boxInfoUser.querySelector(".main-box");
            closeButton.addEventListener("click", ()=>{
                boxInfoUser.classList.toggle("hidden");
            });
            innerAvatar.addEventListener("click",()=>{
                boxInfoUser.classList.toggle("hidden");
            });
            innerName.addEventListener("click",()=>{
                boxInfoUser.classList.toggle("hidden");
            });
            document.addEventListener('click', function(event) {
                if (!mainBox.contains(event.target) && !closeButton.contains(event.target) && boxInfoUser.contains(event.target)) {
                    boxInfoUser.classList.add("hidden");
                }
            });
        }
    });
}

