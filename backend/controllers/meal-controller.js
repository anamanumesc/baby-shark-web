const Meal = require('../models/meal');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'baby-shark';

exports.addMeals = async (req, res) => {
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
        const { descriptions } = JSON.parse(body);

        if (!descriptions || !Array.isArray(descriptions)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid descriptions' }));
            return;
        }

        try {
            const mealPromises = descriptions.map(description => {
                const newMeal = new Meal({
                    userId,
                    description
                });
                return newMeal.save();
            });

            await Promise.all(mealPromises);

            await User.findByIdAndUpdate(userId, { mealForm: true });

            const user = await User.findById(userId);
            const token = jwt.sign({ userId: user._id, userName: user.name, userCode: user.code, sleepForm: user.sleepForm, mealForm: user.mealForm }, JWT_SECRET, { expiresIn: '1h' });

            res.writeHead(201, { 
                'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600`,
                'Set-Cookie': `clientToken=${token}; Path=/; Max-Age=3600`,
                'Content-Type': 'application/json' 
            });

            res.end(JSON.stringify({ message: 'Meals added successfully' }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Server error' }));
        }
    });
};

exports.resetMealForm = async (req, res) => {
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
        const updatedUser = await User.findByIdAndUpdate(userId, { mealForm: false }, { new: true });

        const token = jwt.sign({ userId: updatedUser._id, userName: updatedUser.name, userCode: updatedUser.code, sleepForm: updatedUser.sleepForm, mealForm: updatedUser.mealForm }, JWT_SECRET, { expiresIn: '1h' });

        res.writeHead(200, { 
            'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600`,
            'Set-Cookie': `clientToken=${token}; Path=/; Max-Age=3600`,
            'Content-Type': 'application/json' 
        });

        res.end(JSON.stringify({ message: 'Meal form reset successfully' }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server error' }));
    }
};
