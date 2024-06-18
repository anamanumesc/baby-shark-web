const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true }, // Added username
    code: { type: String, required: true }, // Added code
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    uid: { type: String, unique: true }
});

userSchema.statics.login = async function(email, password) {
    try {
        const user = await this.findOne({ email });
        if (!user) {
            return { error: 'No user found with this email.' };
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { error: 'Password is incorrect.' };
        }
        return { success: 'User authenticated successfully.' };
    } catch (error) {
        return { error: error.message };
    }
};

const User = mongoose.model('User', userSchema, 'users');
module.exports = User;
