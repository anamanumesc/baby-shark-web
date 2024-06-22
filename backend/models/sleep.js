const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sleepSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    goToSleepTime: { type: String, required: true },
    wakeUpTime: { type: String, required: true }
});

module.exports = mongoose.model('Sleep', sleepSchema);
