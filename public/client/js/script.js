// Show Alert
const showAlert = document.querySelector("[show-alert]");
if(showAlert){
    const time = parseInt(showAlert.getAttribute("data-time"));
    setTimeout(()=>{
        showAlert.classList.add("alert-hidden");
    },time);
}

// sHow Dropdown
const userAvatar = document.querySelector(".avatar");
if(userAvatar){
    const listAction = document.querySelector(".list-action");
    userAvatar.addEventListener("click", ()=> {
        listAction.classList.toggle("show-list");
    });
    
    document.addEventListener('click', function(event) {
        // Kiểm tra xem phần tử được click có nằm trong dropdown hay không
        if (!listAction.contains(event.target) && !userAvatar.contains(event.target)) {
            // Nếu không, đóng dropdown
            listAction.classList.remove("show-list");
        }
    });
}

// Closing website
window.addEventListener('beforeunload', function (event) {
    socket.emit("CLOSING_WEB", "close-web");
});

const friendAction = document.querySelector(".friend-action");
if(friendAction){
    const myId = document.querySelector("[user-id]").getAttribute("user-id");
    socket.on("RECIEVE_REQUEST_FRIEND",(data)=>{
        if(myId == data.userB._id){
            const friendRequest = friendAction.querySelector("#accept-friend-nav span");
            if(friendRequest){
                friendRequest.innerHTML = data.countRequestFriend;
            }
            else{
                const friendRequestBtn = friendAction.querySelector("#accept-friend-nav");
                const span = document.createElement("span");
                span.innerHTML = `${data.countRequestFriend}`;
                friendRequestBtn.appendChild(span);
            }
        }
    });   
}


const innerUser = document.querySelector(".inner-user");
if(innerUser){
    const boxUserSetting = document.querySelector(".box-user-setting ");
    const closeButton = boxUserSetting.querySelector("[close-button]");
    closeButton.addEventListener("click",()=>{
        boxUserSetting.classList.add("hidden");
    });

    const openUserBox = innerUser.querySelector("[open-user-box]");
    openUserBox.addEventListener("click",()=>{
        boxUserSetting.classList.remove("hidden");       
    });
    const mainBox = boxUserSetting.querySelector(".main-box");
    document.addEventListener('click', function(event) {
        if (!mainBox.contains(event.target) && !closeButton.contains(event.target) && boxUserSetting.contains(event.target)) {
            boxUserSetting.classList.add("hidden");
        }
    });
}

const userSettingBox = document.querySelector(".box-user-setting");
if(userSettingBox){
    const inputImage = userSettingBox.querySelector(".box-head input[name='avatar']");
    const userImg = userSettingBox.querySelector(".box-head img");
    inputImage.addEventListener("change",()=>{
        const file = inputImage.files[0];
        userImg.src = URL.createObjectURL(file);
    });
}