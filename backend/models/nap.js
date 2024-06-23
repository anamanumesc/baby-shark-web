const mongoose = require('mongoose');

const napSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startNapTime: { type: String, required: true },
    endNapTime: { type: String, required: true }
});

const Nap = mongoose.model('Nap', napSchema);
module.exports = Nap;
