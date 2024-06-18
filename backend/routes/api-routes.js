const { login, signUp } = require('../controllers/user-controller');
const handleApiRequest = require('../controllers/api-controller');
const parseMultipartFormData = require('../middlewares/multipart');
const { getUserIdFromToken } = require('../middlewares/auth');
const Post = require('../models/post');
const Tag = require('../models/tag');
const User = require('../models/user'); // Add User model import
const isUserFriend = require('../utils/is-user-friend');
const path = require('path');
const fs = require('fs');

const apiRoutes = (req, res) => {
    if (req.method === 'POST' && req.url === '/api/login') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            req.body = JSON.parse(body);
            login(req, res);
        });
    } else if (req.method === 'POST' && req.url === '/api/signup') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            req.body = JSON.parse(body);
            signUp(req, res);
        });
    } else if (req.method === 'POST' && req.url === '/api/upload') {
        parseMultipartFormData(req, async (err, fields, files) => {
            if (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
                return;
            }

            try {
                const { description, tags } = fields;
                const file = files.file;
                const userId = getUserIdFromToken(req);

                if (!userId) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not authenticated' }));
                    return;
                }

                // Save the uploaded file
                const uploadDir = path.join(__dirname, '../uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir);
                }
                const filePath = path.join(uploadDir, file.filename);
                fs.writeFileSync(filePath, file.content);

                // Save the post
                const post = new Post({
                    user_id: userId,
                    file_path: filePath,
                    file_type: 'image/png', // Assuming the file is an image, adjust as needed
                    description,
                    timestamp: new Date()
                });
                await post.save();

                // Handle tags if provided
                if (tags) {
                    const tagArray = tags.split(' ').map(tag => tag.trim());
                    for (const tag of tagArray) {
                        const match = tag.match(/^@(.+)#(\d+)$/);
                        if (match) {
                            const [_, username, code] = match;
                            const taggedUser = await User.findOne({ username, code });

                            // Validate if the tagged user is a friend
                            const isFriend = await isUserFriend(userId, taggedUser._id);
                            if (taggedUser && isFriend) {
                                const tagEntry = new Tag({
                                    post_id: post._id,
                                    tagged_user_id: taggedUser._id
                                });
                                await tagEntry.save();
                            }
                        }
                    }
                }

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Post created successfully' }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    } else {
        handleApiRequest(req, res);
    }
};

module.exports = apiRoutes;
