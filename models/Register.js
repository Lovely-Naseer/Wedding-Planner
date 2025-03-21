const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Mobile_no : { type: Number, required: true },
    Wedding_Address: { type: String, required: true },
    Wedding_date: { type: Date , required: true },
});

module.exports = mongoose.model('Register', userSchema);