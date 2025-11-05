document.getElementById("login-button").addEventListener("click", function () {
    window.location.href = "login.ejs";
});

const fileInput = document.getElementById("profile_image");
const fileChosen = document.getElementById("file-chosen");

fileInput.addEventListener("change", function () {
    fileChosen.textContent = this.files.length > 0 ? this.files[0].name : "No file chosen";
});