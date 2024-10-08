const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'baby-shark';

async function signUp(req, res) {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User already exists with this email.' }));
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let code;
        let isUnique = false;

        while (!isUnique) {
            code = String(Math.floor(Math.random() * 9999 + 1)).padStart(4, '0');
            const existingUserWithCode = await User.findOne({ name, code });
            if (!existingUserWithCode) {
                isUnique = true;
            }
        }

        const newUser = new User({
            name,
            code,
            email,
            password: hashedPassword,
            sleepForm: false,
            mealForm: false,
            admin: false 
        });

        await newUser.save();

        const token = jwt.sign({ userId: newUser._id, userName: newUser.name, userCode: newUser.code, sleepForm: newUser.sleepForm, mealForm: newUser.mealForm, admin: newUser.admin }, JWT_SECRET, { expiresIn: '1h' });

        console.log("Token generated:", token);

        res.writeHead(201, { 
            'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600`,
            'Set-Cookie': `clientToken=${token}; Path=/; Max-Age=3600`,
            'Content-Type': 'application/json' 
        });

        res.end(JSON.stringify({ message: 'User created successfully.' }));
    } catch (error) {
        console.error('Error during signup:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No user found with this email.' }));
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Password is incorrect.' }));
            return;
        }

        const token = jwt.sign({ userId: user._id, userName: user.name, userCode: user.code, sleepForm: user.sleepForm, mealForm: user.mealForm, admin: user.admin }, JWT_SECRET, { expiresIn: '1h' });

        console.log("Token generated:", token);

        res.writeHead(200, {
            'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600`,
            'Set-Cookie': `clientToken=${token}; Path=/; Max-Age=3600`,
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({ success: 'User authenticated successfully.' }));
    } catch (error) {
        console.error('Error during login:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

async function getNonAdminUsers(req, res) {
    try {
        const users = await User.find({ $or: [{ admin: false }, { admin: { $exists: false } }] }).lean();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

async function banUser(req, res) {
    try {
        const { username, code } = req.body;
        const user = await User.findOneAndDelete({ name: username, code: code });
        if (user) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User banned successfully' }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User not found' }));
        }
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

module.exports = { getNonAdminUsers, login, signUp, banUser };
