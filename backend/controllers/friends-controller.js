const Friend = require('../models/friends');

async function createFriendship(req, res) {
    const { user1_id, user2_id, status = 'pending' } = req.body; // Default status is 'pending'
    try {
        // Check if the friendship already exists
        const existingFriendship = await Friend.findOne({ user1_id, user2_id });
        if (existingFriendship) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Friendship already exists.' }));
            return;
        }

        // Create a new friendship
        const friendship = new Friend({ user1_id, user2_id, status });
        await friendship.save();

        // Respond with success message
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Friendship created successfully.' }));
    } catch (error) {
        // Handle any errors
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

async function getFriendships(req, res) {
    try {
        // Fetch all friendships
        const friendships = await Friend.find();
        
        // Respond with the list of friendships
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(friendships));
    } catch (error) {
        // Handle any errors
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

module.exports = { createFriendship, getFriendships };
