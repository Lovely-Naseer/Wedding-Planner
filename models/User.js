const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    UserName: { type: String, required: true, unique: true },
    Password: { type: String, required: true }
});

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('Password')) return next();
    this.Password = await bcrypt.hash(this.Password, 10);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.Password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
