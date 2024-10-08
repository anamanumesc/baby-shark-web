document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const mediaSection = document.getElementById('mediaSection');

    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const friendTag = document.getElementById('friendTag').value;

        try {
            const response = await fetch(`/api/see-memorable?friendTag=${encodeURIComponent(friendTag)}`);
            const posts = await response.json();

            if (response.ok) {
                displayPosts(posts);
            } else {
                alert('Error: ' + posts.error);
            }
        } catch (error) {
            console.error('Error fetching memorable moments:', error);
        }
    });

    function displayPosts(posts) {
        mediaSection.innerHTML = '';

        posts.forEach(post => {
            const container = document.createElement('div');
            container.className = 'media-container';

            const info = document.createElement('div');
            info.className = 'media-info';
            info.innerHTML = `
                <div class="date">Date: ${new Date(post.createdAt).toLocaleDateString()}</div>
                <div class="description">Description: ${post.description}</div>
            `;

            const media = document.createElement('div');
            media.className = 'media';

            const fileType = post.filePath.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
                const img = document.createElement('img');
                img.src = `/uploads/${post.filePath}`;
                img.alt = post.description;
                img.className = 'upload-image';
                media.appendChild(img);
            } else if (['mp4', 'webm', 'ogg'].includes(fileType)) {
                const video = document.createElement('video');
                video.src = `/uploads/${post.filePath}`;
                video.controls = true;
                video.className = 'upload-video';
                media.appendChild(video);
            } else if (['mp3', 'wav', 'ogg'].includes(fileType)) {
                const audio = document.createElement('audio');
                audio.src = `/uploads/${post.filePath}`;
                audio.controls = true;
                audio.className = 'upload-audio';
                media.appendChild(audio);
            } else {
                media.textContent = 'Unsupported file type';
            }

            container.appendChild(info);
            container.appendChild(media);
            mediaSection.appendChild(container);
        });
    }
});
