// Send OTP Again
const formSendAgain = document.querySelector("[form-send-again]");
if(formSendAgain){
    const sendAgainBtn = document.querySelector("[send-again-btn]");
    sendAgainBtn.addEventListener("click", () => {
        formSendAgain.submit();
    });
}
