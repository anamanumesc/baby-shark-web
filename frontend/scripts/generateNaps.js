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

function parseJwt (token) {
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
        window.location.href = '/frontend/html/401.html';
        return;
    }

    try {
        const decodedToken = parseJwt(token);
        console.log('Decoded token:', decodedToken); // Debugging log
        const username = decodedToken.userName;

        if (!username) {
            console.error('Username not found in decoded token:', decodedToken);
            window.location.href = '/frontend/html/401.html';
            return;
        }
    } catch (e) {
        console.error('Error decoding token:', e);
        window.location.href = '/frontend/html/401.html';
    }
});

document.getElementById('generateButton').addEventListener('click', function() {
    var numNaps = parseInt(document.getElementById('numNaps').value, 10);
    var napTimesContainer = document.getElementById('napTimesContainer');

    napTimesContainer.innerHTML = '';

    for (var i = 1; i <= numNaps; i++) {
        var napLabel = document.createElement('label');
        napLabel.textContent = 'Nap ' + i + ' times:';
        napTimesContainer.appendChild(napLabel);

        for (var j = 1; j <= 2; j++) {
            var napInput = document.createElement('input');
            napInput.type = 'time';
            napInput.name = 'napTime' + i + '-' + j;
            napInput.required = true;
            napTimesContainer.appendChild(napInput);
        }

        napTimesContainer.appendChild(document.createElement('br'));
    }

    var submitButton = document.getElementById('submitButton');
    submitButton.classList.remove('hidden');
    napTimesContainer.appendChild(submitButton);
    var isMobile = window.matchMedia('(max-width: 600px)').matches;
    document.querySelector('h2').style.marginTop = isMobile ? '50vh' : '100vh';
});
