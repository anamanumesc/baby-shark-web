const Friend = require('../models/friends');
const User = require('../models/user');

async function createFriendship(req, res) {
    const { user1_id, user2_id, status = 'pending' } = req.body;
    try {
        const user1 = await User.findById(user1_id);
        const user2 = await User.findById(user2_id);

        if (!user1 || !user2) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'One or both users do not exist.' }));
            return;
        }

        const existingFriendship = await Friend.findOne({
            $or: [
                {
                    'user1._id': user1._id,
                    'user1.name': user1.name,
                    'user1.uid': user1.uid,
                    'user2._id': user2._id,
                    'user2.name': user2.name,
                    'user2.uid': user2.uid
                },
                {
                    'user1._id': user2._id,
                    'user1.name': user2.name,
                    'user1.uid': user2.uid,
                    'user2._id': user1._id,
                    'user2.name': user1.name,
                    'user2.uid': user1.uid
                }
            ]
        });

        if (existingFriendship) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Friendship already exists.' }));
            return;
        }

        const friendship = new Friend({
            user1: { _id: user1._id, name: user1.name, uid: user1.uid },
            user2: { _id: user2._id, name: user2.name, uid: user2.uid },
            status
        });
        await friendship.save();

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Friendship created successfully.' }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

async function getFriendships(req, res) {
    try {
        const userId = req.userId;
        const friendships = await Friend.find({
            status: 'accepted',
            $or: [
                { 'user1._id': userId },
                { 'user2._id': userId },
                { user1_id: userId },
                { user2_id: userId }
            ]
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(friendships));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

module.exports = { createFriendship, getFriendships };
