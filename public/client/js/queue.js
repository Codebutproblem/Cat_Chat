const userId = document.querySelector("[user-id]").getAttribute("user-id");
let left_room = false;
let room_chat_id = "";
socket.on("FOUND_STRANGER", (room_id) => {
    socket.emit("JOIN_ROOM", {
        room_id: room_id,
        user_id: userId
    });
});

socket.on("JOIN_NOW", (data)=>{
    if(data.user_1._id == userId || data.user_2._id == userId){
        room_chat_id = data.room_id;
        const main = document.querySelector(".main");
        const title = main.querySelector("h1");
        title.innerHTML = "Đã tìm thấy phòng";
        const back = main.querySelector("a:last-child");
        const aBtns = main.querySelectorAll("a");
        console.log(aBtns.length);
        if (aBtns.length == 1){
            const user = data.user_1._id != userId ? data.user_1 : data.user_2;
            const div = document.createElement("div");
            div.classList.add("info-join");
            div.innerHTML = `
                <div class="inner-img">
                    <img src=${user.avatar} alt="Avatar">
                </div>
                <h3>${user.fullName}</h3>
            `;
            main.insertBefore(div, back);

            const button = document.createElement("a");
            button.setAttribute("href",`/chat/stranger/room/${data.room_id}`);
            button.setAttribute("class",`go-chat btn btn-success btn-lg mb-3`);
            button.innerHTML = "Chat";
            main.insertBefore(button, back);
            const goChatBtn = document.querySelector(".main .go-chat");
            goChatBtn.addEventListener("click",()=>{
                left_room = true;
            });
        }
    }
});

socket.on("MAKE_CLIENT_LEAVE_QUEUE",()=>{
    left_room = true;
    window.location.href = "/chat/stranger";
});
window.addEventListener('beforeunload', function (e) {
    if(!left_room && room_chat_id){
        socket.emit("LEAVE_QUEUE", {
            userId: userId,
            room_id: room_chat_id
        });
    }
});
