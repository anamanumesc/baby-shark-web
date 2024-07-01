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

function getSignatureFromToken(token) {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        throw new Error('Invalid JWT token');
    }
    return tokenParts[2];
}

function base64UrlEncode(input) {
    const base64 = CryptoJS.enc.Base64.stringify(input);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function validateSignature(token, secret) {
    const [header, payload, signature] = token.split('.');

    const data = `${header}.${payload}`;
    const expectedSignature = base64UrlEncode(CryptoJS.HmacSHA256(data, secret));

    console.log('Actual signature:', signature);
    console.log('Expected signature:', expectedSignature);

    return signature === expectedSignature;
}

document.addEventListener("DOMContentLoaded", function() {
    // Retrieve token from cookies
    const token = getCookie('clientToken');

    if (!token) {
        console.error('Token cookie not found');
        window.location.href = '../html/401.html';
        return;
    }

    try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const username = decodedToken.userName;

        if (!username) {
            console.error('Username not found in decoded token:', decodedToken);
            window.location.href = '../html/401.html';
            return;
        }

        const secret = 'baby-shark';
        if (!validateSignature(token, secret)) {
            window.location.href = '../html/401.html';
            return;
        }

    } catch (e) {
        console.error('Error decoding token:', e);
        window.location.href = '../html/401.html';
    }
});
