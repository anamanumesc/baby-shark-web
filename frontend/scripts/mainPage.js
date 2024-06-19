function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, ...cookieParts] = cookie.split('=');
        const trimmedCookieName = cookieName.trim();
        if (trimmedCookieName === name) {
            return decodeURIComponent(cookieParts.join('='));
        }
    }
    return null;
}

document.addEventListener("DOMContentLoaded", function() {
    const usernameElement = document.querySelector('.username');

    if (usernameElement) {
        // Retrieve token from cookies
        const token = getCookie('clientToken');

        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                const username = decodedToken.userName;

                if (username) {
                    usernameElement.textContent = '@' + username;
                } else {
                    console.error('Username not found in decoded token:', decodedToken);
                }
            } catch (e) {
                console.error('Error decoding token:', e);
            }
        } else {
            console.error('Token cookie not found');
        }
    } else {
        console.error('Element with class "username" not found in HTML');
    }
});
