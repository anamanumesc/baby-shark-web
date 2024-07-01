function getCookie(name) {
    const cookies = document.cookie.split(';');
    console.log('Cookies:', cookies);
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
    console.log('Retrieved token:', token);
    if (!token || !isValidToken(token)) {
        console.error('Invalid or missing token');
        window.location.href = '../../views/401.html';
        return;
    }

    try {
        const decodedToken = parseJwt(token);
        console.log('Decoded token:', decodedToken);
        const username = decodedToken.userName;

        if (!username) {
            console.error('Username not found in decoded token:', decodedToken);
            window.location.href = '../../views/401.html';
            return;
        }
    } catch (e) {
        console.error('Error decoding token:', e);
        window.location.href = '../../views/401.html';
    }
});

document.getElementById('generateButton').addEventListener('click', function() {
    console.log('Generate button clicked');
    var numMeals = parseInt(document.getElementById('numMeals').value, 10);
    console.log('Number of meals:', numMeals);
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

        var startTimeLabel = document.createElement('label');
        startTimeLabel.textContent = 'Meal ' + i + ' start time:';
        mealDescriptionsContainer.appendChild(startTimeLabel);

        var startTimeInput = document.createElement('input');
        startTimeInput.type = 'time';
        startTimeInput.name = 'startTime' + i;
        startTimeInput.required = true;
        mealDescriptionsContainer.appendChild(startTimeInput);

        var endTimeLabel = document.createElement('label');
        endTimeLabel.textContent = 'Meal ' + i + ' end time:';
        mealDescriptionsContainer.appendChild(endTimeLabel);

        var endTimeInput = document.createElement('input');
        endTimeInput.type = 'time';
        endTimeInput.name = 'endTime' + i;
        endTimeInput.required = true;
        mealDescriptionsContainer.appendChild(endTimeInput);

        mealDescriptionsContainer.appendChild(document.createElement('br'));
    }

    var submitButton = document.getElementById('submitButton');
    console.log('Submit button before class change:', submitButton);
    submitButton.classList.remove('hidden');
    console.log('Submit button after class change:', submitButton);
});

document.getElementById('submitButton').addEventListener('click', async function(event) {
    event.preventDefault();
    console.log('Submit button clicked');
    var meals = [];
    var mealInputs = document.querySelectorAll('#mealDescriptionsContainer textarea');
    var startTimeInputs = document.querySelectorAll('#mealDescriptionsContainer input[type="time"][name^="startTime"]');
    var endTimeInputs = document.querySelectorAll('#mealDescriptionsContainer input[type="time"][name^="endTime"]');

    for (var i = 0; i < mealInputs.length; i++) {
        meals.push({
            description: mealInputs[i].value,
            startTime: startTimeInputs[i].value,
            endTime: endTimeInputs[i].value
        });
    }
    console.log('Meals:', meals);

    if (meals.some(meal => meal.description.trim() === '' || meal.startTime.trim() === '' || meal.endTime.trim() === '')) {
        alert('Meal description, start time, and end time cannot be empty');
        return;
    }

    try {
        const token = getCookie('clientToken');
        console.log('Submitting meals with token:', token);
        const response = await fetch('/api/meals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ meals })
        });

        if (response.ok) {
            alert('Meals added successfully');
            window.location.href = '../../views/eating-schedule.html';
        } else {
            const result = await response.json();
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error adding meals:', error);
        alert('Error adding meals: ' + error.message);
    }
});
