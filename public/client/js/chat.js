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
// Hàm lắng nghe sự kiện xóa tin nhắn
function deleteMessageListen(button){
    button.addEventListener("click", ()=>{
        const chatId = button.closest("[chat-id]").getAttribute("chat-id");
        const chatBox = document.querySelector(".chat");
        const deleteMessageBackground = document.createElement("div");
        deleteMessageBackground.classList.add("delete-message-background");
        deleteMessageBackground.setAttribute("chat-id",chatId);
        deleteMessageBackground.innerHTML=`
            <div class="delete-message-box">
                <div class="inner-content">Delete message?</div>
                <div class="inner-button">
                    <button class="btn btn-warning mx-2 no-btn">No</button>
                    <button class="btn btn-danger mx-2 yes-btn">Yes</button>
                </div>
            </div>
        `;
        const noBtn = deleteMessageBackground.querySelector(".no-btn");
        noBtn.addEventListener("click", ()=>{
            chatBox.removeChild(deleteMessageBackground);
        });
        const yesBtn = deleteMessageBackground.querySelector(".yes-btn");
        yesBtn.addEventListener("click", ()=>{
            socket.emit("DELETE_MESSAGE", chatId);
            chatBox.removeChild(deleteMessageBackground);
        });
        chatBox.appendChild(deleteMessageBackground);
        console.log(chatBox);
    });
}
// Hàm lắng nghe sự kiện trả lời tin nhắn
function answerMessageListen(button){
    button.addEventListener("click", ()=>{
        const messageBox = button.closest("[chat-id]");
        let innerName = "";
        let innerContent = "";
        if(messageBox.querySelector(".inner-name")){
            innerName = messageBox.querySelector(".inner-name").innerHTML;
        }
        if(messageBox.querySelector(".inner-content")){
            innerContent = messageBox.querySelector(".inner-content").innerHTML;
        }
        const chatId = messageBox.getAttribute("chat-id");
        const innerPreview = document.querySelector(".inner-foot .inner-preview");
        if(innerPreview.querySelector(".answer-message")){
            innerPreview.removeChild(innerPreview.querySelector(".answer-message"));
        }
        const answerMessageBox = document.createElement("div");
        answerMessageBox.classList.add("answer-message");
        answerMessageBox.setAttribute("chat-id",chatId);
        answerMessageBox.innerHTML = `
            <div class="inner-name">${innerName ? innerName: "ME"}</div>
            <div class="inner-content">${innerContent}</div>
            <span class="close-button"><i class="fa-regular fa-circle-xmark"></i></span>
        `;
        const closeButton = answerMessageBox.querySelector(".close-button");
        closeButton.addEventListener("click", ()=>{
            innerPreview.removeChild(answerMessageBox);
        });
        const previewImages = innerPreview.querySelector(".preview-images");
        innerPreview.insertBefore(answerMessageBox,previewImages);
        const messageInput = document.querySelector(".inner-form input[name='content']");
        messageInput.focus();
    });
}

// Hàm lắng nghe sự kiện khi người dùng click vào answer content
function clickAnswerContentListen(content){
    content.addEventListener("click",()=>{
        const innerBody = document.querySelector(".inner-body");
        const messageContent = innerBody.querySelector(`[chat-id="${content.getAttribute("answer-id")}"] .inner-content`);
        
        messageContent.scrollIntoView({ 
            behavior: 'smooth', // Để có hiệu ứng cuộn mượt
            block: 'start',     // Cuộn đến phía trên của phần tử con
            inline: 'nearest'   // Cuộn đến phía gần nhất của phần tử cha
        });
    });
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
        for(let i = 0; i< Math.min(4, uploadInput.files.length); i++){
            if(!uploadInput.files[i].notSelected){
                images.push(uploadInput.files[i])
            }
        }
        if (content || images.length > 0) {
            const answerMessageBox = document.querySelector(".inner-foot .inner-preview .answer-message");
            socket.emit("CLIENT_SEND_MESSAGE", {
                content: content,
                images: images,
                answerId: answerMessageBox ? answerMessageBox.getAttribute("chat-id") : ""
            });
            event.target.elements.content.value = "";
            uploadInput.value = "";
            const previewImage = document.querySelector(".chat .inner-preview .preview-images");
            previewImage.innerHTML = "";
            const innerPreview = document.querySelector(".inner-foot .inner-preview");
            const answerBox = innerPreview.querySelector(".answer-message");
            if(answerBox){
                innerPreview.removeChild(answerBox);
            }
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
    let actions = "";
    let contentAnswer = "";
    const answerChatContent = document.querySelector(`[chat-id="${data.answerId}"] .inner-content`);
    if(answerChatContent){
        contentAnswer = `
            <div class="answer-content" answer-id="${data.answerId}">
                <div class="inner-message">${answerChatContent.querySelector(".message") ? answerChatContent.querySelector(".message").innerHTML : ""}</div>
                <div class="inner-images">${answerChatContent.querySelector(".inner-images") ? answerChatContent.querySelector(".inner-images").innerHTML : ""}</div>
            </div>
        `;
    }
    
    if (myId == data.userId) {
        div.classList.add("inner-outgoing");
        actions = `
            <div class="actions">
                <span class="delete-message-button"><i class="fa-solid fa-trash"></i></span>
                <span class="respone-message-button"><i class="fa-solid fa-quote-left"></i></span>
            </div>
        `
    }
    else {
        div.classList.add("inner-comming");
        htmlFullName = `</div class="inner-name">${data.fullName}</div>`
        actions = `
            <div class="actions">
                <span class="respone-message-button"><i class="fa-solid fa-quote-right"></i></span>
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
    htmlContent = `
        <div class="inner-content">
            ${contentAnswer}
            <div class="message">${data.content ? data.content : ""}</div>
            ${htmlImages}
            <div class="time">${getCurrentTime()}</div>
        </div>
    `;
    
    div.innerHTML = `${htmlFullName}${htmlContent}${actions}`;
    body.appendChild(div);

    if(div.querySelector(".answer-content")){
        const answerContent = div.querySelector(".answer-content");
        clickAnswerContentListen(answerContent);
    }

    if(data.chatId){
        div.setAttribute("chat-id",data.chatId);
    }
    if(myId == data.userId){
        const deleteMessageBin = div.querySelector(".actions .delete-message-button");
        console.log(deleteMessageBin);
        deleteMessageListen(deleteMessageBin);
    }
    const answerMessageBtn = div.querySelector(".actions .respone-message-button");
    answerMessageListen(answerMessageBtn);
    // Thông báo tin nhắn nếu người dùng không ở trang
    if(myId != data.userId && activeSound){
        soundMessage.addEventListener("click", function() {
            soundMessage.play();
        });
        soundMessage.click();
    }
    reviewFullImage();
    body.scrollTop = body.scrollHeight;
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

// Hiển thị trạng thái online
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


// Upload Imgae
const uploadInput = document.querySelector("#file-upload-image");
if(uploadInput){
    const previewImage = document.querySelector(".chat .inner-preview .preview-images");
    uploadInput.addEventListener("change", (event)=>{
        for(let i = 0; i < Math.min(4,event.target.files.length); i++){
            const file = event.target.files[i];
            if(file){
                const url = URL.createObjectURL(file);
                const div = document.createElement("div");
                div.classList.add("box-preview");
                div.innerHTML = `
                    <img src=${url} />
                    <span class="delete-show-image"><i class="fa-solid fa-x"></i></span>
                `;
                previewImage.appendChild(div);
                const span = div.querySelector("span");
                span.addEventListener("click", ()=>{
                    previewImage.removeChild(div);
                    event.target.files[i].notSelected = true;
                }); 
            }
        }
        const innerPreviewImage = document.querySelector(".chat .inner-preview");
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        innerPreviewImage.style.bottom = `calc(100% + ${scrollBarWidth}px)`
        window.scrollTo(0, document.body.scrollHeight);
    });

}



// Delete message
const deleteMessageBins = document.querySelectorAll(".delete-message-button");
if(deleteMessageBins && deleteMessageBins.length > 0){
    deleteMessageBins.forEach(button =>{
       deleteMessageListen(button);
    });
}


// Display delete chat
socket.on("SERVER_RETURN_DELETE_MESSAGE",(data)=>{
    const deletedMessage = document.querySelector(`.inner-body [chat-id="${data.chatId}"]`);
    deletedMessage.innerHTML=`<div class="deleted-content"> The message has been deleted </div>`;
});



// Answer message
const answerMessageButtons = document.querySelectorAll(".respone-message-button")
if(answerMessageButtons && answerMessageButtons.length > 0){
    answerMessageButtons.forEach(button => {
        answerMessageListen(button);
    });
}
const answerContents = document.querySelectorAll(".inner-content .answer-content");
if(answerContents.length > 0){
    answerContents.forEach(content => {
        clickAnswerContentListen(content);
    });
}