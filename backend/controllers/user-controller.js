const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require("jsonwebtoken");

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

        let uid;
        let isUnique = false;

        while (!isUnique) {
            uid = String(Math.floor(Math.random() * 9999 + 1)).padStart(4, '0');
            const existingUID = await User.findOne({ name, uid });
            if (!existingUID) {
                isUnique = true;
            }
        }

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            uid
        });

        await newUser.save();

        const token = jwt.sign({ userId: newUser._id, userName: newUser.name, userUid: newUser.uid }, "babyshark", { expiresIn: '1h' });

        res.writeHead(201, { 
            'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600`,
            'Content-Type': 'application/json' 
        });
        
        res.end(JSON.stringify({ message: 'User created successfully.' }));
    } catch (error) {
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
        
        const token = jwt.sign({ userId: user._id, userName: user.name, userUid: user.uid }, "babyshark", { expiresIn: '1h' });

        res.writeHead(200, {
            'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600`,
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({ success: 'User authenticated successfully.' }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

module.exports = { login, signUp };
