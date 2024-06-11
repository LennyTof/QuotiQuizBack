const mongoose = require('mongoose');
const moment = require('moment-timezone');

const dailyQuizSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    default: () => moment().tz('Europe/Paris').startOf('day').toDate()
  },
  quizIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }]
});

module.exports = mongoose.model('DailyQuiz', dailyQuizSchema);
