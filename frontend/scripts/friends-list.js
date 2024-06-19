import { getCookie } from './cookieUtils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const token = getCookie('token');

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

        const friendships = await response.json();
        console.log('Fetched friendships data:', friendships);

        const gridContainer = document.querySelector('.grid-container');

        if (!gridContainer) {
            throw new Error('Grid container not found in HTML.');
        }

        // Clear the grid container before appending new data
        gridContainer.innerHTML = '';

        friendships.forEach(friendship => {
            if (friendship.status === 'accepted') {
                const friend = document.createElement('div');
                friend.classList.add('friend');

                const userId = getCookie('userId');

                if (friendship.user1._id === userId) {
                    friend.textContent = friendship.user2.name || 'Unknown';
                } else if (friendship.user2._id === userId) {
                    friend.textContent = friendship.user1.name || 'Unknown';
                } else {
                    console.error('User ID not found in friendship:', friendship);
                    return;
                }

                gridContainer.appendChild(friend);
            }
        });
    } catch (error) {
        console.error('Error fetching friends:', error);
        alert('Error fetching friends. Please try again later.');
    }
});
