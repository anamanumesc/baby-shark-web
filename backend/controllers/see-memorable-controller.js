const User = require('../models/user');
const Post = require('../models/post');
const Friend = require('../models/friends');

const getMemorableMoments = async (friendTag, reqUserId, res) => {
    try {
        const [friendName, friendCode] = friendTag.split('#');
        const requester = await User.findById(reqUserId);
        const friend = await User.findOne({ name: friendName.replace('@', ''), code: friendCode });

        if (!requester || !friend) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'One or both users not found' }));
        }

        const friendship = await Friend.findOne({
            $or: [
                { 'user1._id': requester._id, 'user2._id': friend._id, status: 'accepted' },
                { 'user1._id': friend._id, 'user2._id': requester._id, status: 'accepted' }
            ]
        });

        if (!friendship) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'You are not friends with this user' }));
        }

        const posts = await Post.find({
            $or: [
                { uploader: requester._id, tags: friend._id },
                { uploader: friend._id, tags: requester._id }
            ]
        }).populate('uploader', 'name code').populate('tags', 'name code');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(posts));
    } catch (error) {
        console.error('Error fetching memorable moments:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
};

module.exports = { getMemorableMoments };
