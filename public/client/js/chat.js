import * as Popper from 'https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js';
function getCurrentTime() {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();

    var formattedTime = padZero(hours) + ":" + padZero(minutes);

    return formattedTime;
}
function padZero(num) {
    return (num < 10 ? '0' : '') + num;
}
function reviewFullImage(){
    // Review Full Images
    const bodyChatPreviewImage = document.querySelector(".chat .inner-body");
    if (bodyChatPreviewImage) {
        const gallery = new Viewer(bodyChatPreviewImage);
    }
}
// Scroll chat to bottom
function scrollToBottom() {
    const bodyChat = document.querySelector(".main .chat .inner-body");
    if (bodyChat) {
        bodyChat.scrollTop = bodyChat.scrollHeight;
    }
    window.scrollTo(0, document.body.scrollHeight);
}
const soundMessage = document.getElementById("audio-message");
scrollToBottom();
reviewFullImage();

let activeSound = false;
// Kiểm tra nếu trình duyệt hỗ trợ API Visibility
if (typeof document.hidden !== "undefined") {
    // Lắng nghe sự kiện visibilitychange
    document.addEventListener("visibilitychange", function() {
        if (document.hidden) {
            // Trang web đang ẩn, người dùng có thể không xem
            activeSound = true;
        } else {
            // Trang web đang hiển thị lại
            activeSound = false;
        }
    });
}

// SEND MESSAGE TO SERVER
const formSendData = document.querySelector(".main .chat .inner-form");
if (formSendData) {
    formSendData.addEventListener("submit", (event) => {
        event.preventDefault();
        const content = event.target.elements.content.value;
        const uploadInput = document.querySelector("#file-upload-image");
        const images = [];
        for(let i = 0; i< uploadInput.files.length; i++){
            if(!uploadInput.files[i].notSelected){
                images.push(uploadInput.files[i])
            }
        }
        if (content || images.length > 0) {
            socket.emit("CLIENT_SEND_MESSAGE", {
                content: content,
                images: images
            });
            event.target.elements.content.value = "";
            uploadInput.value = "";
            const previewImage = document.querySelector(".chat .inner-preview-images .preview-images");
            previewImage.innerHTML = "";
            socket.emit("CLIENT_SEND_TYPING", "hidden");
        }
    });
}
// RECEIVE SERVER MESSAGE
socket.on("SERVER_RETURN_MESSAGE", (data) => {
    const myId = document.querySelector("[my-id]").getAttribute("my-id");
    const body = document.querySelector(".main .chat .inner-body");
    const div = document.createElement("div");
    let htmlFullName = "";
    let htmlImages = "";
    let htmlContent = "";
    if (myId == data.userId) {
        div.classList.add("inner-outgoing");
    }
    else {
        div.classList.add("inner-comming");
        htmlFullName = `</div class="inner-name">${data.fullName}</div>`
    }

    if (data.content) {
        htmlContent = `
        <div class="inner-content">
            <div class="message">${data.content}</div>
            <div class="time">${getCurrentTime()}</div>
       </div>
       `
    }
    if (data.images && data.images.length > 0) {
        htmlImages += `<div class="inner-images">`;
        for (const image of data.images) {
            htmlImages += `<img src=${image}>`
        }
        htmlImages += `</div>`;
    }
    div.innerHTML = `${htmlFullName}${htmlContent}${htmlImages}`;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;

    // Thông báo tin nhắn nếu người dùng không ở trang
    if(myId != data.userId && activeSound){
        soundMessage.addEventListener("click", function() {
            soundMessage.play();
        });
        soundMessage.click();
    }
});


// SHow icon chat
const buttonIcon = document.querySelector(".button-icon");
if (buttonIcon) {
    const tooltip = document.querySelector(".tooltip");
    Popper.createPopper(buttonIcon, tooltip);
    buttonIcon.addEventListener("click", () => {
        tooltip.classList.toggle("shown");
    });
    document.addEventListener('click', function (event) {
        // Kiểm tra xem phần tử được click có nằm trong tooltip hay không
        if (!tooltip.contains(event.target) && !buttonIcon.contains(event.target)) {
            // Nếu không, đóng tooltip
            tooltip.classList.remove("shown");
        }
    });
}


const emojiPicker = document.querySelector("emoji-picker");
if (emojiPicker) {
    let timeOut;
    // Display emoji
    const inputChat = document.querySelector(".chat .inner-foot input[name='content']");
    emojiPicker.addEventListener("emoji-click", event => {
        const icon = event.detail.unicode;
        inputChat.value = inputChat.value + icon;

        inputChat.focus();
        inputChat.setSelectionRange(inputChat.value.length, inputChat.value.length);

        socket.emit("CLIENT_SEND_TYPING", "show");
        clearTimeout(timeOut);
        timeOut = setTimeout(() => {
            socket.emit("CLIENT_SEND_TYPING", "hidden");
        }, 2000);
    });


    // Input keyup
    inputChat.addEventListener("keyup", (event) => {
        if (event.key != "Enter") {
            socket.emit("CLIENT_SEND_TYPING", "show");
        }
        clearTimeout(timeOut);
        timeOut = setTimeout(() => {
            socket.emit("CLIENT_SEND_TYPING", "hidden");
        }, 2000);
    });
}

// SERVER RETURN TYPING
socket.on("SERVER_RETURN_TYPING", (data) => {
    const body = document.querySelector(".main .chat .inner-body");
    const existTyping = document.querySelector(".chat .inner-body .box-typing");
    switch (data.type) {
        case "show":
            if (!existTyping) {
                const boxTyping = document.createElement("div");
                boxTyping.classList.add("box-typing");
                boxTyping.setAttribute("user-id", data.userId);

                boxTyping.innerHTML = `
                    <div class="inner-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>`
                body.appendChild(boxTyping);
                scrollToBottom();
            }
            break;
        case "hidden":
            if (existTyping) {
                body.removeChild(existTyping);
            }
            break;
    }
});


socket.on("SERVER_RETURN_STATUS" , (data) => {
    const onlineSymbol = document.querySelector(`.inner-avatar span`);
    if (data.status == "online"){
        if(!onlineSymbol.classList.contains("online")){
            onlineSymbol.classList.add("online")
        }
    }
    else{
        onlineSymbol.classList.remove("online");
    }
});

const temporaryRoom = document.querySelector("[room-id]");
if(temporaryRoom){
    let left_room = false;
    socket.on("SERVER_MAKE_CLIENT_LEAVE",()=>{
        left_room = true;
        window.location.href = "/chat/stranger";
    });
    window.addEventListener('beforeunload', function (e) {
        if(!left_room){
            socket.emit("CLIENT_LEAVE_ROOM", temporaryRoom.getAttribute("room-id"));
        }
    });
}

const uploadInput = document.querySelector("#file-upload-image");
if(uploadInput){
    const previewImage = document.querySelector(".chat .inner-preview-images .preview-images");
    uploadInput.addEventListener("change", (event)=>{
        for(let i = 0; i < event.target.files.length; i++){
            const file = event.target.files[i];
            if(file){
                const url = URL.createObjectURL(file);
                const div = document.createElement("div");
                div.classList.add("box-preview");
                div.innerHTML = `
                    <img src=${url} />
                    <span class="delete-show-image">X</span>
                `;
                previewImage.appendChild(div);
                const span = div.querySelector("span");
                span.addEventListener("click", ()=>{
                    previewImage.removeChild(div);
                    event.target.files[i].notSelected = true;
                }); 
            }
        }
        const innerPreviewImage = document.querySelector(".chat .inner-preview-images");
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        innerPreviewImage.style.bottom = `calc(100% + ${scrollBarWidth}px)`
        window.scrollTo(0, document.body.scrollHeight);
    });

}