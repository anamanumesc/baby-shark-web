document.addEventListener('DOMContentLoaded', async () => {
    const token = getCookie('clientToken');

    if (!token) {
        console.error('Token not found');
        window.location.href = '../html/401.html';
        return;
    }

    try {
        const response = await fetch('/api/medical', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const medicalVisits = await response.json();
            const medicalFeed = document.getElementById('medicalFeed');
            medicalFeed.innerHTML = '';

            medicalVisits.forEach(visit => {
                const feedItem = document.createElement('div');
                feedItem.classList.add('feed-item');
                feedItem.innerHTML = `
                    <h3>Visit Date: ${visit.dateOfVisit}</h3>
                    <p>Doctor: ${visit.doctor}</p>
                    <p>Description: ${visit.description}</p>
                    ${visit.fileName ? `<p>File: <a href="${visit.filePath}" download>${visit.fileName}</a></p>` : ''}
                `;
                medicalFeed.appendChild(feedItem);
            });
        } else {
            console.error('Failed to fetch medical visits');
        }
    } catch (error) {
        console.error('Error fetching medical visits:', error.message);
    }
});

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
