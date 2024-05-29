function openPopup() {
    console.log("Popup opened!"); // add this line to log a message
    var modal = document.getElementById("myModal");
    modal.style.display = "block";
}

function closePopup() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}

var addButton = document.getElementById("addButton");
addButton.addEventListener("click", openPopup);
    