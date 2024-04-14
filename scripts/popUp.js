// Function to open the modal popup
function openPopup() {
    console.log("Popup opened!"); // Add this line to log a message
    var modal = document.getElementById("myModal");
    modal.style.display = "block";
}

// Function to close the modal popup
function closePopup() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}

// Get the "Add on this website" button and add a click event listener
var addButton = document.getElementById("addButton");
addButton.addEventListener("click", openPopup);
    