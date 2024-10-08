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

function isValidToken(token) {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        return false;
    }
    return true;
}

document.addEventListener("DOMContentLoaded", function() {
    const token = getCookie('clientToken');
    if (token && isValidToken(token)) {
        window.location.href = '/views/main-page.html';
    }
});