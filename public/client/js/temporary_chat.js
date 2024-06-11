// Client Leave Temporary Room
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

// Report Button
const reportButton = document.querySelector(".actions-button .report-btn");
if(reportButton){
    reportButton.addEventListener("click",()=>{
        const userId = document.querySelector("[my-id]").getAttribute("my-id");
        const strangerId = document.querySelector("[stranger-id]").getAttribute("stranger-id");
        socket.emit("CLIENT_REPORT_STRANGER",{
            stranger_id: strangerId,
            user_id: userId
        });
        reportButton.disabled = true;
        reportButton.innerHTML = "Reported";
    });
}