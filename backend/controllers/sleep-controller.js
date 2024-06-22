const Sleep = require('../models/sleep');
const Nap = require('../models/nap');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'baby-shark'; // Hardcoded JWT secret

exports.addSleep = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    let userId;

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        userId = decodedToken.userId;
    } catch (error) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Unauthorized' }));
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        const { goToSleepTime, wakeUpTime, naps } = JSON.parse(body);

        if (!goToSleepTime || !wakeUpTime || !naps || !Array.isArray(naps) || naps.some(nap => !nap.startNapTime || !nap.endNapTime)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid sleep or nap times' }));
            return;
        }

        try {
            const newSleep = new Sleep({
                userId,
                goToSleepTime,
                wakeUpTime
            });

            await newSleep.save();

            const napPromises = naps.map(nap => {
                const newNap = new Nap({
                    userId,
                    startNapTime: nap.startNapTime,
                    endNapTime: nap.endNapTime
                });
                return newNap.save();
            });

            await Promise.all(napPromises);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Sleep and naps added successfully' }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Server error' }));
        }
    });
};
