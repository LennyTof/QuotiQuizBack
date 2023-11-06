const Quiz = require('../models/quiz');

// exports.findAllQuiz = (req, res, next) => {
//   Quiz.find()
//     .then(quizs => res.status(200).json(quizs))
//     .catch(error => res.status(400).json({error}));
// };

exports.findAllQuiz = (req, res, next) => {
  const quiz = [
    {
      _id: 'zihpvz',
      question: "J'ai quel âge ?",
      options: ["25 ans", "26 ans", "28 ans"],
      correctAnswer: "27 ans",
    },
    {
      _id: 'hozfefze',
      question: "Comment je m'appelle ?",
      options: ["Tom", "Olivier", "Ilan"],
      correctAnswer: "Lenny",
    },
  ];
  res.status(200).json(quiz);
}

exports.createQuiz = (req, res, next) => {
  delete req.body._id;
  const quiz = new Quiz({
    question: req.body.question,
    options: req.body.options,
    correctAnswer: req.body.correct
  });
  quiz.save()
    .then(() => res.status(201).json({ message: 'Question enregistré !'}))
    .catch(error => res.status(400).json({ error }));
}
