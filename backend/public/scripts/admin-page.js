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

function isValidToken(token) {
    const tokenParts = token.split('.');
    return tokenParts.length === 3;
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
        const isAdmin = decodedToken.admin;

        if (!isAdmin) {
            window.location.href = '../../views/401.html';
            return;
        }

        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', function(event) {
                event.preventDefault();
                deleteCookie('clientToken');
                window.location.href = '../../views/start-page.html';
            });
        }

        const banButton = document.getElementById('banButton');
        if (banButton) {
            banButton.addEventListener('click', async function() {
                const userInput = document.getElementById('user-search').value;
                const [username, code] = userInput.split('#');
                if (username && code) {
                    await banUser(username.trim(), code.trim());
                } else {
                    alert('Please enter a valid username and code in the format "Username#0000".');
                }
            });
        }

        fetchNonAdminUsers();

    } catch (e) {
        window.location.href = '.../../views/401.html';
    }
});

async function fetchNonAdminUsers() {
    try {
        const token = getCookie('clientToken');
        const response = await fetch('/api/get-non-admin-users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const users = await response.json();
            const usersList = document.getElementById('nonAdminUsersList');
            usersList.innerHTML = '';
            users.forEach(user => {
                const listItem = document.createElement('li');
                listItem.textContent = `${user.name} (${user.code})`;
                usersList.appendChild(listItem);
            });
        } else {
            console.error('Failed to fetch non-admin users');
        }
    } catch (error) {
        console.error('Error fetching non-admin users:', error);
    }
}

async function banUser(username, code) {
    try {
        const token = getCookie('clientToken');
        const response = await fetch('/api/ban-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, code })
        });

        if (response.ok) {
            alert('User banned successfully');
            fetchNonAdminUsers();
        } else {
            const result = await response.json();
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error banning user:', error);
        alert('An error occurred while banning the user');
    }
}

function deleteCookie(name) {
    console.log('Deleting cookie:', name);
    document.cookie = name + '=; path=/; domain=' + location.hostname + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = name + '=; path=/frontend; domain=' + location.hostname + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = name + '=; path=/frontend/html; domain=' + location.hostname + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('Cookie after deletion:', document.cookie);
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
