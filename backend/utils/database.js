const mongoose = require('mongoose');

const connectDatabase = (MONGO_URL) => {
    mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    mongoose.connection.on('connected', () => {
        console.log('Connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
        console.error(`Failed to connect to MongoDB: ${err.message}`);
    });
};

module.exports = connectDatabase;
