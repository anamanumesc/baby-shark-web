const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    description: { type: String, required: true },
    filePath: { type: String, required: true },
    uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
