document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginContainer = document.querySelector('.log-in');
    const signupContainer = document.querySelector('.sign-up');

    document.querySelector("button[onclick='showSignupForm()']").addEventListener('click', showSignupForm);
    document.querySelector("button[onclick='showLoginForm()']").addEventListener('click', showLoginForm);

    function showSignupForm() {
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'block';
    }

    function showLoginForm() {
        signupContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    }

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();
            if (response.ok) {
                alert('Login successful');
                window.location.href = '/frontend/main-page.html';
            } else {
                alert('Login failed: ' + result.error);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Login failed: ' + error.message);
        }
    });

    signupForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const name = document.getElementById('nameInput').value;
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        const password2 = document.getElementById('passwordInput2').value;

        if (password !== password2) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const result = await response.json();
            if (response.ok) {
                alert('Signup successful');
                window.location.href = '/frontend/main-page.html';
            } else {
                alert('Signup failed: ' + result.error);
            }
        } catch (error) {
            console.error('Error during signup:', error);
            alert('Signup failed: ' + error.message);
        }
    });
});