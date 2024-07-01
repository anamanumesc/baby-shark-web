document.addEventListener("DOMContentLoaded", function() {
    const usernameElement = document.querySelector('.username');

    if (!usernameElement) {
        console.error('Element with class "username" not found in HTML');
        return;
    }

    const token = getCookie('clientToken');

    if (!token) {
        console.error('Token cookie not found');
        window.location.href = 'html/401.html';
        return;
    }

    try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const username = decodedToken.userName;
        const isAdmin = decodedToken.admin;

        if (!username) {
            console.error('Username not found in decoded token:', decodedToken);
            window.location.href = 'html/401.html';
            return;
        }

        if (isAdmin) {
            window.location.href = 'html/admin-page.html';
            return;
        }

        usernameElement.textContent = '@' + username;

        const secret = 'baby-shark';
        if (!validateSignature(token, secret)) {
            window.location.href = 'html/401.html';
            return;
        }

        fetchUploads(token);
    } catch (e) {
        console.error('Error decoding token:', e);
        window.location.href = 'html/401.html';
    }

    const uploadForm = document.getElementById('uploadForm');
    let isSubmitting = false;

    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            if (isSubmitting) {
                console.log('Form is already being submitted.');
                return;
            }
            isSubmitting = true;

            const submitButton = uploadForm.querySelector('input[type="submit"]');
            submitButton.disabled = true;

            const formData = new FormData(uploadForm);
            const token = getCookie('clientToken');

            const tagsField = document.getElementById('tags');
            let tags = tagsField.value.split(',').map(tag => tag.trim()).filter(tag => tag);
            if (tags.length === 0) {
                tags = [];
            }
            formData.set('tags', JSON.stringify(tags));

            const fileInput = document.getElementById('file');
            const file = fileInput.files[0];

            if (file && file.type.startsWith('image/')) {
                const resizedFile = await resizeImage(file, 300, 300);
                formData.set('file', resizedFile, file.name);
            }

            try {
                console.log('Submitting form...');
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    alert('File uploaded successfully');
                    fetchUploads(token);
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('An error occurred while uploading the file');
            } finally {
                submitButton.disabled = false;
                isSubmitting = false;
            }
        });
    }
});

function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height *= maxWidth / width));
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width *= maxHeight / height));
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    resolve(new File([blob], file.name, { type: file.type }));
                },
                file.type,
                0.9
            );
        };

        img.onerror = (err) => reject(err);
    });
}

async function fetchUploads(token) {
    try {
        const response = await fetch('/api/uploads', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const uploads = await response.json();
            displayUploads(uploads);
        } else {
            console.error('Failed to fetch uploads:', await response.json());
        }
    } catch (error) {
        console.error('Error fetching uploads:', error);
    }
}

function displayUploads(uploads) {
    const squareContainer = document.querySelector('.square-container');
    squareContainer.innerHTML = '';

    uploads.reverse().forEach(upload => {
        const square = document.createElement('div');
        square.className = 'square';

        const description = document.createElement('p');
        description.textContent = upload.description;

        const taggedUsers = document.createElement('p');
        taggedUsers.textContent = 'Tagged: ' + (upload.tags.length ? upload.tags.map(tag => `@${tag.name}#${tag.code}`).join(', ') : 'No tags');

        const fileLink = document.createElement('a');
        fileLink.href = `/uploads/${upload.filePath}`;
        fileLink.target = '_blank';

        const fileType = upload.filePath.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
            const img = document.createElement('img');
            img.src = `/uploads/${upload.filePath}`;
            img.alt = upload.description;
            img.className = 'upload-image';
            fileLink.appendChild(img);
        } else if (['mp4', 'webm', 'ogg'].includes(fileType)) {
            const video = document.createElement('video');
            video.src = `/uploads/${upload.filePath}`;
            video.controls = true;
            video.className = 'upload-video';
            fileLink.appendChild(video);
        } else if (['mp3', 'wav', 'ogg'].includes(fileType)) {
            const audio = document.createElement('audio');
            audio.src = `/uploads/${upload.filePath}`;
            audio.controls = true;
            fileLink.appendChild(audio);
        } else {
            fileLink.textContent = upload.description;
        }

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => confirmDelete(upload._id);

        square.appendChild(description);
        square.appendChild(taggedUsers);
        square.appendChild(fileLink);
        square.appendChild(deleteButton);
        squareContainer.prepend(square);
    });
}

function confirmDelete(postId) {
    const confirmation = confirm('Are you sure you want to delete this post?');
    if (confirmation) {
        deletePost(postId);
    }
}

async function deletePost(postId) {
    const token = getCookie('clientToken');

    try {
        const response = await fetch(`/api/uploads/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok) {
            alert('Post deleted successfully');
            fetchUploads(token);
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('An error occurred while deleting the post');
    }
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

function getSignatureFromToken(token) {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        throw new Error('Invalid JWT token');
    }
    return tokenParts[2];
}

function base64UrlEncode(input) {
    const base64 = CryptoJS.enc.Base64.stringify(input);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function validateSignature(token, secret) {
    const [header, payload, signature] = token.split('.');

    const data = `${header}.${payload}`;
    const expectedSignature = base64UrlEncode(CryptoJS.HmacSHA256(data, secret));

    console.log('Actual signature:', signature);
    console.log('Expected signature:', expectedSignature);

    return signature === expectedSignature;
}

function openPopup() {
    var modal = document.getElementById("myModal");
    modal.style.display = "block";
}

function closePopup() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}

document.getElementById("addButton").addEventListener("click", openPopup);
document.getElementById("closeButton").addEventListener("click", closePopup);
