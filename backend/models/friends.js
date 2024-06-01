const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    user1_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    user2_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

const Friend = mongoose.model('Friend', friendSchema, 'friends');

module.exports = Friend;
