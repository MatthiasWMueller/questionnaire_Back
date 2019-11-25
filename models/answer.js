const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const answerSchema = new Schema({
    questionID: String,
    userID: String,
    value: Number,
    chapter: Number
});

module.exports = mongoose.model('Answer', answerSchema);