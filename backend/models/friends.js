const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    user1: {
        type: {
            name: String,
            uid: String,
            _id: mongoose.Schema.Types.ObjectId
        },
        required: true
    },
    user2: {
        type: {
            name: String,
            uid: String,
            _id: mongoose.Schema.Types.ObjectId
        },
        required: true
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
