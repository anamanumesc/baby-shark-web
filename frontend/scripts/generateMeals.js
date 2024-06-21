document.getElementById('generateButton').addEventListener('click', function() {
    var numMeals = parseInt(document.getElementById('numMeals').value, 10);
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
    submitButton.classList.remove('hidden');
});

document.getElementById('submitButton').addEventListener('click', async function(event) {
    event.preventDefault();
    var descriptions = [];
    var mealInputs = document.querySelectorAll('#mealDescriptionsContainer textarea');

    mealInputs.forEach(input => descriptions.push(input.value));

    try {
        const token = getCookie('clientToken');
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
