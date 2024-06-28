import { getCookie } from './cookieUtils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const token = getCookie('clientToken');

    if (!token) {
        console.error('No token found. User is not authenticated.');
        return;
    }

    try {
        const response = await fetch('/api/friends', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch friends list.');
        }

        const friends = await response.json();
        console.log('Fetched friends data:', friends);

        const gridContainer = document.querySelector('#friendListContainer');

        if (!gridContainer) {
            throw new Error('Grid container not found in HTML.');
        }

        gridContainer.innerHTML = '';

        friends.forEach(friend => {
            const friendDiv = document.createElement('div');
            friendDiv.classList.add('friend');
            friendDiv.textContent = `${friend.name} (${friend.code})`;
            gridContainer.appendChild(friendDiv);
        });
    } catch (error) {
        console.error('Error fetching friends:', error);
        alert('Error fetching friends. Please try again later.');
    }
});
