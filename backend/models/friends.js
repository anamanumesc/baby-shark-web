const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    user1: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        code: { type: String, required: true }  // Changed uid to code
    },
    user2: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        code: { type: String, required: true }  // Changed uid to code
    },
    status: { type: String, required: true, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

const Friend = mongoose.model('Friend', friendSchema, 'friends');
module.exports = Friend;
