const multer = require('multer');
const path = require('path');
const Post = require('../models/post');
const User = require('../models/user');
const Friend = require('../models/friends');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

const handleUpload = async (req, res) => {
    console.log('handleUpload called');
    try {
        const { description, tags } = req.body;
        const file = req.file;

        if (!file) {
            console.log('No file uploaded');
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'No file uploaded' }));
        }

        const userId = req.userId;
        if (!userId) {
            console.log('Unauthorized request');
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }

        let friendIds = [];

        if (tags && tags.trim()) {
            const tagList = JSON.parse(tags); 
            if (tagList.length > 0) {
                const processedTags = tagList.map(tag => {
                    const [name, code] = tag.split('#');
                    return { name: name.replace('@', '').trim(), code: code.trim() };
                });

                console.log('Processed tag list:', processedTags);

                const users = await User.find({
                    $or: processedTags.map(tag => ({ name: tag.name, code: tag.code }))
                });

                console.log('Found users:', users);

                if (users.length === 0) {
                    console.log('No matching users found for tags.');
                }

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
                    console.log('None of the tagged users are friends');
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'None of the tagged users are friends' }));
                }
            }
        }

        const relativeFilePath = path.relative(path.join(__dirname, '../uploads'), file.path);
        const existingPost = await Post.findOne({ description, filePath: relativeFilePath });
        if (existingPost) {
            console.log('Duplicate post detected');
            res.writeHead(409, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Duplicate post detected' }));
        }

        const post = new Post({
            description,
            filePath: relativeFilePath,
            tags: friendIds,
            uploader: userId
        });

        await post.save();

        console.log('File uploaded successfully');
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'File uploaded successfully', post }));
    } catch (error) {
        console.error('Error during file upload:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
};

const getUploads = async (req, res) => {
    try {
        const userId = req.userId;
        const uploads = await Post.find({
            $or: [
                { uploader: userId },
                { tags: userId }
            ]
        }).populate('uploader', 'name code').populate('tags', 'name code');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(uploads));
    } catch (error) {
        console.error('Error fetching uploads:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
};


const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Post not found' }));
        }

        if (post.uploader.toString() !== req.userId) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized to delete this post' }));
        }

        await Post.findByIdAndDelete(postId);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Post deleted successfully' }));
    } catch (error) {
        console.error('Error deleting post:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
};


module.exports = { upload, handleUpload, getUploads, deletePost };

