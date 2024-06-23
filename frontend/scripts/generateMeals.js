// Authorization and Token Validation Logic
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
        window.location.href = '../html/401.html';
        return;
    }

    try {
        const decodedToken = parseJwt(token);
        console.log('Decoded token:', decodedToken); // Debugging log
        const username = decodedToken.userName;

        if (!username) {
            console.error('Username not found in decoded token:', decodedToken);
            window.location.href = '../html/401.html';
            return;
        }
    } catch (e) {
        console.error('Error decoding token:', e);
        window.location.href = '../html/401.html';
    }
});

// Meal generation logic
document.getElementById('generateButton').addEventListener('click', function() {
    console.log('Generate button clicked'); // Debugging log
    var numMeals = parseInt(document.getElementById('numMeals').value, 10);
    console.log('Number of meals:', numMeals); // Debugging log
    var mealDescriptionsContainer = document.getElementById('mealDescriptionsContainer');

    mealDescriptionsContainer.innerHTML = '';

    for (var i = 1; i <= numMeals; i++) {
        var mealLabel = document.createElement('label');
        mealLabel.textContent = 'Meal ' + i + ' description:';
        mealDescriptionsContainer.appendChild(mealLabel);

        var mealInput = document.createElement('textarea');
        mealInput.name = 'mealDescription' + i;
        mealInput.required = true;
        mealDescriptionsContainer.appendChild(mealInput);

        mealDescriptionsContainer.appendChild(document.createElement('br'));
    }

    var submitButton = document.getElementById('submitButton');
    console.log('Submit button before class change:', submitButton); // Debugging log
    submitButton.classList.remove('hidden');
    console.log('Submit button after class change:', submitButton); // Debugging log
});

document.getElementById('submitButton').addEventListener('click', async function(event) {
    event.preventDefault();
    console.log('Submit button clicked'); // Debugging log
    var descriptions = [];
    var mealInputs = document.querySelectorAll('#mealDescriptionsContainer textarea');

    mealInputs.forEach(input => descriptions.push(input.value));
    console.log('Meal descriptions:', descriptions); // Debugging log

    if (descriptions.some(description => description.trim() === '')) {
        alert('Meal description cannot be empty');
        return;
    }

    try {
        const token = getCookie('clientToken');
        console.log('Submitting meals with token:', token); // Debugging log
        const response = await fetch('/api/meals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ descriptions })
        });

        if (response.ok) {
            alert('Meals added successfully');
            window.location.href = '../html/eating-schedule.html'; // Redirect after successful submission
        } else {
            const result = await response.json();
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error adding meals:', error);
        alert('Error adding meals: ' + error.message);
    }
});
