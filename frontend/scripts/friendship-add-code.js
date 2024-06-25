document.getElementById('friendRequestForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const code = document.getElementById('code').value;

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    const token = getCookie('clientToken');
    console.log('Retrieved token:', token);

    if (!token) {
        alert('You need to be logged in to send a friend request');
        return;
    }

    try {
        const response = await fetch('/api/friends', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user2_name: name, user2_code: code })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Friend request sent successfully!');
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error during friend request:', error);
        alert('An error occurred while sending the friend request');
    }
});
