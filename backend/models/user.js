const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    sleepForm: { type: Boolean, default: false },
    mealForm: { type: Boolean, default: false },
    admin: { type: Boolean, default: false }
});

userSchema.index({ name: 1, code: 1 }, { unique: true });

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
