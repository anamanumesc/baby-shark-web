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

document.getElementById("uploadForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    if (response.ok) {
        alert('Upload successful');
        closePopup();
        // Optionally, refresh the feed or take any other action
    } else {
        alert('Upload failed: ' + result.error);
    }
});
