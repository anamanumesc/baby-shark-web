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
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        return false;
    }
    // Here we should verify the signature and expiration date if necessary
    return true; // Simplified validation for the example
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
        throw new Error('Invalid token');
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

document.addEventListener("DOMContentLoaded", function() {
    const token = getCookie('clientToken');
    console.log('Retrieved token:', token); // Debugging log
    if (!token || !isValidToken(token)) {
        console.error('Invalid or missing token');
        window.location.href = '../html/401.html';
        return;
    }

    try {
        const decodedToken = parseJwt(token);
        console.log('Decoded token:', decodedToken); // Debugging log

        const sleepForm = decodedToken.sleepForm;
        const mealForm = decodedToken.mealForm;
        const medicalForm = decodedToken.medicalForm;

        const currentPage = window.location.pathname;

        if (sleepForm && currentPage.includes('sleeping-schedule-form.html')) {
            window.location.href = '../html/sleeping-schedule.html';
            return;
        }

        if (mealForm && currentPage.includes('eating-schedule-form.html')) {
            window.location.href = '../html/eating-schedule.html';
            return;
        }

        if (medicalForm && currentPage.includes('medical-form.html')) {
            window.location.href = '../html/medical.html';
            return;
        }
    } catch (e) {
        console.error('Error decoding token:', e);
        window.location.href = '../html/401.html';
    }
});
