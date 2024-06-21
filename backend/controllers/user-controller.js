const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Hardcoded secret key
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
            password: hashedPassword
        });

        await newUser.save();

        const token = jwt.sign({ userId: newUser._id, userName: newUser.name, userCode: newUser.code }, JWT_SECRET, { expiresIn: '1h' });

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

        const token = jwt.sign({ userId: user._id, userName: user.name, userCode: user.code }, JWT_SECRET, { expiresIn: '1h' });

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

module.exports = { login, signUp };