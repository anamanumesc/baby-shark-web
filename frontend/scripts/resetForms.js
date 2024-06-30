async function resetForm(formType) {
    const token = getCookie('clientToken');
    if (!token) {
        console.error('Token cookie not found');
        window.location.href = '../html/401.html';
        return;
    }

    const endpoint = formType === 'meal' ? '/api/reset-meal-form' : '/api/reset-sleep-form';
    const deleteEndpoint = formType === 'meal' ? '/api/delete-meals' : '/api/delete-sleep-naps';

    try {
        // Send DELETE request to delete meals or sleep and naps
        const deleteResponse = await fetch(deleteEndpoint, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!deleteResponse.ok) {
            const deleteResult = await deleteResponse.json();
            alert('Error deleting records: ' + deleteResult.message);
            return;
        }

        // Send POST request to reset form
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

document.addEventListener('DOMContentLoaded', () => {
    const mealRefillButton = document.querySelector('.refill-meal-button');
    const sleepRefillButton = document.querySelector('.refill-sleep-button');

    if (mealRefillButton) {
        mealRefillButton.addEventListener('click', () => resetForm('meal'));
    }

    if (sleepRefillButton) {
        sleepRefillButton.addEventListener('click', () => resetForm('sleep'));
    }
});
