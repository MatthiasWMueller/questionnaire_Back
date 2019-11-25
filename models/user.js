const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: String,
    name: {
        type: String,
        required: true
    },
    pw: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);