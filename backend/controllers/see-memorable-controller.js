const User = require('../models/user');
const Post = require('../models/post');

const getMemorableMoments = async (friendTag, res) => {
    try {
        const [friendName, friendCode] = friendTag.split('#');

        const friend = await User.findOne({ name: friendName.replace('@', ''), code: friendCode });

        if (!friend) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Friend not found' }));
        }

        const posts = await Post.find({ tags: friend._id }).populate('uploader', 'name code').populate('tags', 'name code');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(posts));
    } catch (error) {
        console.error('Error fetching memorable moments:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
};

module.exports = { getMemorableMoments };
