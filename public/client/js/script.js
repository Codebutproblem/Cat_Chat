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

