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

document.getElementById('submitButton').addEventListener('click', async function(event) {
    event.preventDefault();
    var naps = [];
    var napInputs = document.querySelectorAll('#napTimesContainer input[type="time"]');

    for (var i = 0; i < napInputs.length; i += 2) {
        naps.push({
            start: napInputs[i].value,
            end: napInputs[i + 1].value
        });
    }

    const sleep = {
        goToSleepTime: document.getElementById('wakeUpTime').value, 
        wakeUpTime: document.getElementById('sleepTime').value    
    };

    console.log("Form data before sending:");
    console.log("Go to sleep time:", sleep.goToSleepTime);
    console.log("Wake up time:", sleep.wakeUpTime);
    console.log("Naps:", naps);

    if (naps.some(nap => !nap.start || !nap.end)) {
        alert('Nap times cannot be empty');
        return;
    }

    try {
        const token = getCookie('clientToken');
        const response = await fetch('/api/naps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ naps, sleep })
        });

        if (response.ok) {
            alert('Naps and sleep added successfully');
            window.location.href = '../../views/sleeping-schedule.html';
        } else {
            const result = await response.json();
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error adding naps and sleep:', error);
        alert('Error adding naps and sleep: ' + error.message);
    }
});

async function resetForm(formType) {
    const token = getCookie('clientToken');
    if (!token) {
        console.error('Token cookie not found');
        window.location.href = '../../views/401.html';
        return;
    }

    const endpoint = formType === 'meal' ? '/api/reset-meal-form' : '/api/reset-sleep-form';
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const targetFormPage = formType === 'meal' ? 'eating-schedule-form.html' : 'sleeping-schedule-form.html';
            window.location.href = `../html/${targetFormPage}`;
        } else {
            const result = await response.json();
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error resetting form:', error);
        alert('Error resetting form: ' + error.message);
    }
}

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
