const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goToSleepTime: { type: String, required: true },
    wakeUpTime: { type: String, required: true }
});

const Sleep = mongoose.model('Sleep', sleepSchema);
module.exports = Sleep;
