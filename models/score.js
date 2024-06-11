const mongoose = require("mongoose");
const moment = require('moment-timezone');

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
    default: () => moment().tz('Europe/Paris').toDate()
  },
  quizDetails: [{
    question: String,
    userAnswer: String,
    correctAnswer: String
  }]
});

module.exports = mongoose.model('Score', scoreSchema);
