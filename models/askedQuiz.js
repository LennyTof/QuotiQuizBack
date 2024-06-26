const mongoose = require('mongoose');

const quizSchema  = mongoose.Schema({
  question: { type: String, required: true},
  options: { type: [String], required: true},
  correctAnswer: { type: String, required: true},
});

module.exports = mongoose.model('AskedQuiz', quizSchema);
