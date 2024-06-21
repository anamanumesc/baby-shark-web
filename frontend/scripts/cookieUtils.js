export function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName.trim() === name) {
            return cookieValue;
        }
    }
    return null;
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    const token = getCookie('clientToken');
    if (!token) {
        alert("You need to be logged in to view your friends.");
        window.location.href = 'start-page.html'; // Redirect to login page if not logged in
        return;
    }

    const decodedToken = parseJwt(token);
    const userId = decodedToken ? decodedToken.userId : null;

    if (!userId) {
        alert("Error decoding token. Please log in again.");
        window.location.href = 'start-page.html'; // Redirect to login page if token is invalid
        return;
    }

    try {
        const response = await fetch('http://localhost:7081/api/friends', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response: ${errorText}`);
            alert(`Error fetching friends: ${errorText}`);
            return;
        }

        const data = await response.json();
        const friendListContainer = document.getElementById('friendListContainer');

        if (data.error) {
            console.error(`API Error: ${data.error}`);
            alert(`Error fetching friends: ${data.error}`);
            return;
        }

        console.log("Fetched friendships data:", data); // Debugging log

        const acceptedFriendships = data.filter(friendship => {
            return friendship.status === 'accepted' && 
                ((friendship.user1 && friendship.user1._id === userId) || (friendship.user2 && friendship.user2._id === userId) || 
                 (friendship.user1_id === userId) || (friendship.user2_id === userId));
        });

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
        alert('Error fetching friends. Please try again later.');
    }
});
