const Nap = require('../models/nap');
const Sleep = require('../models/sleep');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'baby-shark';

exports.addNaps = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    let userId;

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        userId = decodedToken.userId;
        console.log('Decoded Token:', decodedToken);
    } catch (error) {
        console.error('JWT verification error:', error.message);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Unauthorized' }));
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { naps, sleep } = JSON.parse(body);

            console.log('Received naps:', naps);
            console.log('Received sleep:', sleep);

            if (!naps || !Array.isArray(naps) || naps.some(nap => !nap.start || !nap.end) || !sleep || !sleep.goToSleepTime || !sleep.wakeUpTime) {
                console.error('Invalid naps or sleep data');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid naps or sleep data' }));
                return;
            }

            const napPromises = naps.map(nap => {
                const newNap = new Nap({
                    userId,
                    startNapTime: nap.start,
                    endNapTime: nap.end
                });
                return newNap.save();
            });

            const newSleep = new Sleep({
                userId,
                goToSleepTime: sleep.goToSleepTime,
                wakeUpTime: sleep.wakeUpTime
            });

            await Promise.all(napPromises);
            await newSleep.save();

            console.log('Naps and sleep saved successfully');

            const user = await User.findByIdAndUpdate(userId, { sleepForm: true }, { new: true });

            console.log('Updated user:', user);

            const token = jwt.sign({ 
                userId: user._id, 
                userName: user.name, 
                userCode: user.code, 
                sleepForm: user.sleepForm, 
                mealForm: user.mealForm 
            }, JWT_SECRET, { expiresIn: '1h' });

            res.writeHead(201, { 
                'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600`,
                'Set-Cookie': `clientToken=${token}; Path=/; Max-Age=3600`,
                'Content-Type': 'application/json' 
            });

            res.end(JSON.stringify({ message: 'Naps and sleep added successfully' }));
        } catch (error) {
            console.error('Error during nap and sleep save:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Server error' }));
        }
    });
};

exports.resetSleepForm = async (req, res) => {
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

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, { sleepForm: false }, { new: true });

        const token = jwt.sign({ userId: updatedUser._id, userName: updatedUser.name, userCode: updatedUser.code, sleepForm: updatedUser.sleepForm, mealForm: updatedUser.mealForm }, JWT_SECRET, { expiresIn: '1h' });

        res.writeHead(200, { 
            'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600`,
            'Set-Cookie': `clientToken=${token}; Path=/; Max-Age=3600`,
            'Content-Type': 'application/json' 
        });

        res.end(JSON.stringify({ message: 'Sleep form reset successfully' }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server error' }));
    }
};

exports.getNapTimes = async (req, res) => {
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

    try {
        const napTimes = await Nap.find({ userId }).lean();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(napTimes));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server error' }));
    }
};
