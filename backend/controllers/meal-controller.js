const Meal = require('../models/meal');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'baby-shark'; // Hardcoded JWT secret

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

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Meals added successfully' }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Server error' }));
        }
    });
};
