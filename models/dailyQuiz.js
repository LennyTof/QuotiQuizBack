const mongoose = require('mongoose');

const dailyQuizSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    default: () => new Date().setHours(0, 0, 0, 0)
  },
  quizIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }]
});

module.exports = mongoose.model('DailyQuiz', dailyQuizSchema);
