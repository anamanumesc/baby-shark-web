// models/post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    description: { type: String, required: true },
    filePath: { type: String, required: true },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
