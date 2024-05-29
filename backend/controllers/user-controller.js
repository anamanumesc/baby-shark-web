const bcrypt = require('bcryptjs');
const User = require('../models/user');

async function signUp(req, res) {
    const { name, email, password } = req.body;
    try {
        // check if user exists already
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User already exists with this email.' }));
            return;
        }

        // hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // create a new user with the hashed password
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        // save the new user to the database
        await newUser.save();

        // respond with success message
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User created successfully.' }));
    } catch (error) {
        // handle any errors
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    try {
        //looking to find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No user found with this email.' }));
            return;
        }

        // compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Password is incorrect.' }));
            return;
        }

        // if password matches, it works
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: 'User authenticated successfully.' }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

module.exports = { login, signUp };
