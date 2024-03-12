const userId = document.querySelector("[user-id]").getAttribute("user-id");

socket.on("FOUND_STRANGER", (room_id) => {
    socket.emit("JOIN_ROOM", room_id);
});

socket.on("JOIN_NOW", (data)=>{
    console.log(data);
    if(data.user_1._id == userId || data.user_2._id == userId){
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
        }
    }
});

const backBtn = document.querySelector(".main a:last-child");
if(backBtn){
    backBtn.addEventListener("click", (event)=>{
        socket.emit("LEAVE_QUEUE", userId);
    });
}
