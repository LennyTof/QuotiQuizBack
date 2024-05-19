const mongoose = require('mongoose');

const usedQuizSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  quizIds: { type: [mongoose.Schema.Types.ObjectId] }
});

module.exports = mongoose.model('UsedQuiz', usedQuizSchema);
