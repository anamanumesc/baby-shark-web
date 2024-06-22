const multer = require('multer');
const path = require('path');
const Post = require('../models/post');
const User = require('../models/user');
const Friend = require('../models/friends');
const { getUserIdFromToken } = require('../middlewares/auth'); // Ensure this path is correct

// Set up multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Function to handle upload
const handleUpload = async (req, res) => {
    try {
        const { description, tags } = req.body;
        const file = req.file;

        if (!file) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'No file uploaded' }));
        }

        const userId = req.userId; // Get userId from token
        if (!userId) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }

        // Ensure tags are processed correctly
        const tagList = tags.split(',').map(tag => {
            const [name, code] = tag.split('#');
            return { name: name.replace('@', '').trim(), code: code.trim() };
        });

        console.log('Processed tag list:', tagList);

        const users = await User.find({
            $or: tagList.map(tag => ({ name: tag.name, code: tag.code }))
        });

        console.log('Found users:', users);

        if (users.length === 0) {
            console.log('No matching users found for tags.');
        }

        // Verify friendships
        const friendIds = [];
        for (const user of users) {
            const isFriend = await Friend.findOne({
                $or: [
                    { 'user1._id': userId, 'user2._id': user._id, status: 'accepted' },
                    { 'user1._id': user._id, 'user2._id': userId, status: 'accepted' }
                ]
            });

            console.log(`Checking friendship between ${userId} and ${user._id}:`, isFriend);

            if (isFriend) {
                friendIds.push(user._id);
            } else {
                console.log(`User ${user.name}#${user.code} is not a friend.`);
            }
        }

        if (friendIds.length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'None of the tagged users are friends' }));
        }

        const post = new Post({
            description,
            filePath: file.path,
            tags: friendIds,
        });

        await post.save();

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'File uploaded successfully', post }));
    } catch (error) {
        console.error('Error during file upload:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
};

module.exports = { upload, handleUpload };
