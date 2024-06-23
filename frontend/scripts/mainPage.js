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
    const usernameElement = document.querySelector('.username');

    if (!usernameElement) {
        console.error('Element with class "username" not found in HTML');
        return;
    }

    // Retrieve token from cookies
    const token = getCookie('clientToken');

    if (!token) {
        console.error('Token cookie not found');
        window.location.href = 'html/401.html';
        return;
    }

    try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const username = decodedToken.userName;

        if (!username) {
            console.error('Username not found in decoded token:', decodedToken);
            window.location.href = 'html/401.html';
            return;
        }

        usernameElement.textContent = '@' + username;

        const secret = 'baby-shark';
        if (!validateSignature(token, secret)) {
            window.location.href = 'html/401.html';
            return;
        }

    } catch (e) {
        console.error('Error decoding token:', e);
        window.location.href = 'html/401.html';
    }

    const uploadForm = document.getElementById('uploadForm');
    let isSubmitting = false; // Prevent double submission

    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default form submission

            if (isSubmitting) {
                console.log('Form is already being submitted.'); // Debugging line
                return; // If already submitting, prevent another submission
            }
            isSubmitting = true;

            // Disable the submit button to prevent multiple submissions
            const submitButton = uploadForm.querySelector('input[type="submit"]');
            submitButton.disabled = true;

            const formData = new FormData(uploadForm);
            const token = getCookie('clientToken');

            // Handle empty tags
            const tagsField = document.getElementById('tags');
            if (!tagsField.value.trim()) {
                formData.set('tags', '');
            }

            try {
                console.log('Submitting form...'); // Debugging line
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    alert('File uploaded successfully');
                    // Optionally, refresh or update the UI
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('An error occurred while uploading the file');
            } finally {
                // Re-enable the submit button
                submitButton.disabled = false;
                isSubmitting = false;
            }
        });
    }
});
