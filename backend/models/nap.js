const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const napSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startNapTime: { type: String, required: true },
    endNapTime: { type: String, required: true }
});

module.exports = mongoose.model('Nap', napSchema);
