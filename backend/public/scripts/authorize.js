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

function isValidToken(token) { ///simplificata momentan, e completa doar la main page
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        return false;
    }
    return true;
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
    if (!token || !isValidToken(token)) {
        window.location.href = '../../views/401.html';
        return;
    }

    try {
        const decodedToken = parseJwt(token);

        const sleepForm = decodedToken.sleepForm;
        const mealForm = decodedToken.mealForm;
        const medicalForm = decodedToken.medicalForm;

        const currentPage = window.location.pathname;

        if (sleepForm && currentPage.includes('sleeping-schedule-form.html')) {
            window.location.href = '../../views/sleeping-schedule.html';
            return;
        }

        if (mealForm && currentPage.includes('eating-schedule-form.html')) {
            window.location.href = '../../views/eating-schedule.html';
            return;
        }

        if (medicalForm && currentPage.includes('medical-form.html')) {
            window.location.href = '../../views/medical.html';
            return;
        }

        if (currentPage.includes('friend-list.html') ||
            currentPage.includes('friend-requests.html') ||
            currentPage.includes('friendship-add-code.html') ||
            currentPage.includes('friendship-code.html')) {
            return;
        }
    } catch (e) {
        window.location.href = '../../views/401.html';
    }
});
