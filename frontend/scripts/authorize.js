function getCookie(name) {
    const cookies = document.cookie.split(';');
    console.log('Cookies:', cookies); // Debugging log
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
    return true;
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        return false;
    }
    // Here we should verify the signature and expiration date if necessary
    return true; // Simplified validation for the example
}

document.addEventListener("DOMContentLoaded", function() {
    const token = getCookie('clientToken');
    console.log('Retrieved token:', token); // Debugging log
    ///if (!token || !isValidToken(token)) {
        ///window.location.href = '/frontend/html/401.html';
    ///}
});
