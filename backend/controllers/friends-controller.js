const jwt = require('jsonwebtoken');
const Friend = require('../models/friends');
const User = require('../models/user');
const JWT_SECRET = 'baby-shark';

async function createFriendship(req, res) {
    const { user2_name, user2_code, status = 'pending' } = req.body;
    console.log('createFriendship function called');
    try {
        if (!req.headers.authorization) {
            console.log('Authorization header is missing');
            throw new Error('Authorization header is missing');
        }

        const token = req.headers.authorization.split(' ')[1];
        console.log('Token:', token);

        const decodedToken = jwt.verify(token, JWT_SECRET);
        const user1_id = decodedToken.userId;
        console.log('Decoded Token:', decodedToken);

        const user1 = await User.findById(user1_id);
        const user2 = await User.findOne({ name: user2_name, code: user2_code });

        console.log('User1:', user1);
        console.log('User2:', user2);

        if (!user1 || !user2) {
            console.log('One or both users do not exist.');
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'One or both users do not exist.' }));
            return;
        }

        const existingFriendship = await Friend.findOne({
            $or: [
                { 'user1._id': user1._id, 'user2._id': user2._id },
                { 'user1._id': user2._id, 'user2._id': user1._id }
            ]
        });

        console.log('Existing Friendship:', existingFriendship);

        if (existingFriendship) {
            console.log('Friendship already exists.');
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Friendship already exists.' }));
            return;
        }

        const friendship = new Friend({
            user1: { _id: user1._id, name: user1.name, code: user1.code },
            user2: { _id: user2._id, name: user2.name, code: user2.code },
            status
        });

        await friendship.save();
        console.log('Friendship created:', friendship);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Friendship created successfully.' }));
    } catch (error) {
        console.log('Error:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

async function getFriendships(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;

        const friendships = await Friend.find({
            status: 'accepted',
            $or: [
                { 'user1._id': userId },
                { 'user2._id': userId }
            ]
        });

        const friendsDetails = friendships.map(friendship => {
            if (friendship.user1._id.toString() === userId) {
                return friendship.user2;
            } else {
                return friendship.user1;
            }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(friendsDetails));
    } catch (error) {
        console.error('Error fetching friendships:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}



async function getFriendRequests(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;

        const pendingRequests = await Friend.find({
            status: 'pending',
            'user2._id': userId
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pendingRequests));
    } catch (error) {
        console.error('Error fetching friend requests:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

async function acceptFriendRequest(req, res) {
    try {
        const { friendshipId } = req.body;

        const updatedFriendship = await Friend.findByIdAndUpdate(
            friendshipId,
            { status: 'accepted' },
            { new: true }
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Friend request accepted', friendship: updatedFriendship }));
    } catch (error) {
        console.error('Error accepting friend request:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

async function deleteFriendRequest(req, res) {
    try {
        const { friendshipId } = req.body;

        await Friend.findByIdAndDelete(friendshipId);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Friend request deleted' }));
    } catch (error) {
        console.error('Error deleting friend request:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

module.exports = { createFriendship, getFriendships, getFriendRequests, acceptFriendRequest, deleteFriendRequest };
