function updateRequestedNotification(){
    const requestedNotification = document.querySelector(".header .friend-action a span");
    console.log(requestedNotification);
    const requestedCount = parseInt(requestedNotification.innerHTML);
    if(requestedCount > 1){
        requestedNotification.innerHTML = requestedCount - 1;
    }
    else{
        document.querySelector(".header .friend-action a:nth-child(3)").removeChild(requestedNotification);
    }
}


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
        button.addEventListener("click", (event)=>{
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
    });
}

// Đồng ý kết bạn
const listBtnAccept = document.querySelectorAll(".inner-users .accept-btn");
if(listBtnAccept.length > 0){
    listBtnAccept.forEach(button => {
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
    });
}
// Hủy kết bạn
const listBtnUnfriend = document.querySelectorAll(".inner-users .unfriend-btn");
if(listBtnUnfriend.length > 0){
    listBtnUnfriend.forEach(button => {
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
    });
}

socket.on("SERVER_RETURN_STATUS" , (data) => {
    const onlineSymbols = document.querySelectorAll(`.box-user > span`);
    for(const symbol of onlineSymbols){
        const userId = symbol.getAttribute("user-id");
        if(userId == data.userId){
            if (data.status == "online" && !symbol.classList.contains("online")){
                symbol.classList.add("online")
            }
            else{
                symbol.classList.remove("online");
            }
            break;
        }
    }
});