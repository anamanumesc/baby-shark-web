const Friend = require('../models/friends');

async function isUserFriend(userId, friendId) {
    const friendship = await Friend.findOne({
        $or: [
            { user1: userId, user2: friendId, status: 'accepted' },
            { user1: friendId, user2: userId, status: 'accepted' }
        ]
    });
    return !!friendship;
}

module.exports = isUserFriend;
