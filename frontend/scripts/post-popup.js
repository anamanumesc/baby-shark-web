function openPopup() {
    var modal = document.getElementById("myModal");
    modal.style.display = "block";
}

function closePopup() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}

document.getElementById("addButton").addEventListener("click", openPopup);
document.getElementById("closeButton").addEventListener("click", closePopup);
