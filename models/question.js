const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const questionSchema = new Schema({
//    id: String,
    left: {
        type: String,
    },
    right: {
        type: String,
    },
    chapter: {
        type: Number
    }
});

module.exports = mongoose.model('Question', questionSchema);