const mongoose = require("mongoose");

const scoreSchema = mongoose.Schema({
  value: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now
  },
  quizDetails: [{
    question: String,
    userAnswer: String,
    correctAnswer: String
  }]
});

module.exports = mongoose.model('Score', scoreSchema);
