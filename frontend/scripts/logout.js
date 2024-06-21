function deleteCookie(name) {
    console.log('Deleting cookie:', name);  // Debugging log
    document.cookie = name + '=; path=/; domain=' + location.hostname + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = name + '=; path=/frontend; domain=' + location.hostname + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = name + '=; path=/frontend/html; domain=' + location.hostname + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('Cookie after deletion:', document.cookie);  // Debugging log
}

document.addEventListener("DOMContentLoaded", function() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault();
            deleteCookie('clientToken');
            window.location.href = '/frontend/html/start-page.html';
        });
    }
});
