const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const statsSchema = new Schema({
    user: String,
    totalAVG: Number,
    answerProg: [Number],
    chapter: [
        {
          chapterScore: Number,
          valueCounts: [Number, Number, Number, Number, Number]
        }
      ]
});

module.exports = mongoose.model('Stats', statsSchema);