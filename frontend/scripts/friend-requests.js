document.addEventListener('DOMContentLoaded', async () => {
    const token = getCookie('clientToken');
    
    if (!token) {
        alert('You need to be logged in to view friend requests');
        window.location.href = 'start-page.html';
        return;
    }

    try {
        const response = await fetch('/api/friend-requests', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const friendRequests = await response.json();

        if (response.ok) {
            renderFriendRequests(friendRequests);
        } else {
            console.error('Error fetching friend requests:', friendRequests.error);
        }
    } catch (error) {
        console.error('Error during fetch friend requests:', error);
    }
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function renderFriendRequests(friendRequests) {
    const container = document.getElementById('friendRequestsContainer');
    container.innerHTML = '';

    friendRequests.forEach(request => {
        const friendDiv = document.createElement('div');
        friendDiv.classList.add('friend-request');

        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${request.user1.name} (${request.user1.code})`;

        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accept';
        acceptButton.onclick = () => handleFriendRequest(request._id, 'accept');

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => handleFriendRequest(request._id, 'delete');

        friendDiv.appendChild(nameSpan);
        friendDiv.appendChild(acceptButton);
        friendDiv.appendChild(deleteButton);

        container.appendChild(friendDiv);
    });
}

async function handleFriendRequest(friendshipId, action) {
    const token = getCookie('clientToken');
    const url = action === 'accept' ? '/api/accept-friend-request' : '/api/delete-friend-request';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ friendshipId })
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            window.location.reload();
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error(`Error during ${action} friend request:`, error);
        alert(`An error occurred while trying to ${action} the friend request`);
    }
}
