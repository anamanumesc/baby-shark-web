import { getCookie, parseJwt } from './cookieUtils.js';

document.addEventListener("DOMContentLoaded", async function() {
    const token = getCookie('clientToken');
    if (!token) {
        window.location.href = 'start-page.html';
        return;
    }

    const decodedToken = parseJwt(token);
    const userId = decodedToken ? decodedToken.userId : null;

    if (!userId) {
        window.location.href = 'start-page.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:7083/api/friends', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response: ${errorText}`);
            window.location.href = '401.html';
            return;
        }

        const data = await response.json();
        const friendListContainer = document.getElementById('friendListContainer');

        if (data.error) {
            console.error(`API Error: ${data.error}`);
            window.location.href = '401.html';
            return;
        }

        const acceptedFriendships = data.filter(friendship => 
            friendship.status === 'accepted' &&
            ((friendship.user1 && friendship.user1._id === userId) || 
            (friendship.user2 && friendship.user2._id === userId) || 
            (friendship.user1_id === userId) || 
            (friendship.user2_id === userId))
        );

        if (acceptedFriendships.length === 0) {
            friendListContainer.innerHTML = "<p>No friends found.</p>";
        } else {
            acceptedFriendships.forEach(friendship => {
                const friendElement = document.createElement('div');
                friendElement.className = 'friend';
                
                let friend;
                if (friendship.user1 && friendship.user1._id && friendship.user2 && friendship.user2._id) {
                    friend = friendship.user1._id === userId ? friendship.user2 : friendship.user1;
                } else if (friendship.user1_id && friendship.user2_id) {
                    friend = friendship.user1_id === userId ? { _id: friendship.user2_id } : { _id: friendship.user1_id };
                }

                if (!friend) {
                    console.error('Error: Friend data is missing:', friendship);
                    return;
                }

                friendElement.textContent = `${friend.name || 'Unknown'} (${friend.uid || friend._id})`;
                friendListContainer.appendChild(friendElement);
            });
        }
    } catch (error) {
        console.error('Error fetching friends:', error);
        window.location.href = '401.html';
    }
});
