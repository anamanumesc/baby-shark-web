function getCookie(name) {
    const cookieArray = document.cookie.split(';');
    for (let cookie of cookieArray) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName.trim() === name) {
            return cookieValue;
        }
    }
    return null;
}

document.addEventListener("DOMContentLoaded", function() {
    const usernameElement = document.querySelector('.username');

    if (usernameElement) {
        // Retrieve token from cookies
        const token = getCookie('token');
        
        if (token) {
            console.log('Token:', token);

            // Decode the token
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            console.log('Decoded token:', decodedToken);

            // Extract username from decoded token
            const username = decodedToken.userName;

            if (username) {
                usernameElement.textContent = '@' + username;
            } else {
                console.error('Username not found in decoded token:', decodedToken);
            }
        } else {
            console.error('Token cookie not found');
        }
    } else {
        console.error('Element with class "username" not found in HTML');
    }
});