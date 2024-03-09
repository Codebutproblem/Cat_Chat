const userId = document.querySelector("[user-id]").getAttribute("user-id");
let roomId = "";
socket.on("FOUND_STRANGER", (room_id) => {
    roomId = room_id;
    socket.emit("JOIN_ROOM", room_id);
});

socket.on("JOIN_NOW", (room_id)=>{
    const main = document.querySelector(".main");
    const title = main.querySelector("h1");
    title.innerHTML = "Đã tìm thấy phòng";
    const back = main.querySelector("a:last-child");
    const aBtns = main.querySelectorAll("a");
    if (aBtns.length == 1){
        const button = document.createElement("a");
        button.setAttribute("href",`/chat/stranger/room/${room_id}`);
        button.setAttribute("class",`go-chat btn btn-success btn-lg mb-3`);
        button.innerHTML = "Chat";
        main.insertBefore(button, back);
    }
});
