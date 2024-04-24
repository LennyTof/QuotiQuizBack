const Quiz = require('../models/quiz');
const AskedQuiz = require('../models/askedQuiz');

 exports.findAllQuiz = (req, res, next) => {
   Quiz.find()
    .then(quizs => res.status(200).json(quizs))
    .catch(error => res.status(400).json({error}));
 };

 exports.findOneQuiz = (req, res, next) => {
  const quizId = req.params.id;
  Quiz.findById(quizId)
    .then(quiz => {
      if (!quiz) {
        return res.status(404).json({ message: "Question non trouvée"});
      }
      res.status(200).json(quiz);
    })
    .catch(error => res.status(400).json({ error }));
 };

exports.createQuiz = (req, res, next) => {
  delete req.body._id;
  const quiz = new Quiz({
    question: req.body.question,
    options: req.body.options,
    correctAnswer: req.body.correctAnswer
  });
  quiz.save()
    .then(() => res.status(201).json({ message: "Question enregistré !"}))
    .catch(error => res.status(400).json({ error }));
};

exports.updateQuiz = (req, res, next) => {
  const quizId = req.params.id;
  const updateQuiz = {
    question: req.body.question,
    options: req.body.options,
    correctAnswer: req.body.correctAnswer
  };
  Quiz.findByIdAndUpdate(quizId, updateQuiz, { new:true })
    .then(updateQuiz => {
      if (!updateQuiz) {
        return res.status(404).json({ message: "Question non trouvée"});
      }
      res.status(200).json(updateQuiz);
    })
    .catch(error => res.status(400).json({ error }));
};

exports.deleteQuiz = (req, res, next) => {
  const quizId = req.params.id;
  Quiz.findByIdAndDelete(quizId)
    .then(() => res.status(200).json({ message: "Question supprimé"}))
    .catch(error => res.status(400).json({ error }));
};

//méthode pour gérer les questions proposées par les utilisateurs

 exports.findAllAskedQuiz = (req, res, next) => {
  AskedQuiz.find()
    .then(quizs => res.status(200).json(quizs))
    .catch(error => res.status(400).json({error}));
 };

 exports.findOneAskedQuiz = (req, res, next) => {
  const quizId = req.params.id;
  AskedQuiz.findById(quizId)
    .then(quiz => {
      if (!quiz) {
        return res.status(404).json({ message: "Question non trouvée"});
      }
      res.status(200).json(quiz);
    })
    .catch(error => res.status(400).json({ error }));
 };

exports.createAskedQuiz = (req, res, next) => {
  console.log("Creating an asked quiz", req.body)
  delete req.body._id;
  const quiz = new AskedQuiz({
    question: req.body.question,
    options: req.body.options,
    correctAnswer: req.body.correctAnswer
  });
  quiz.save()
    .then(() => res.status(201).json({ message: "Question enregistré !"}))
    .catch(error => res.status(400).json({ error }));
};

exports.updateAskedQuiz = (req, res, next) => {
  const quizId = req.params.id;
  const updateQuiz = {
    question: req.body.question,
    options: req.body.options,
    correctAnswer: req.body.correctAnswer
  };
  AskedQuiz.findByIdAndUpdate(quizId, updateQuiz, { new:true })
    .then(updateQuiz => {
      if (!updateQuiz) {
        return res.status(404).json({ message: "Question non trouvée"});
      }
      res.status(200).json(updateQuiz);
    })
    .catch(error => res.status(400).json({ error }));
};

exports.deleteAskedQuiz = (req, res, next) => {
  const quizId = req.params.id;
  AskedQuiz.findByIdAndDelete(quizId)
    .then(() => res.status(200).json({ message: "Question supprimé"}))
    .catch(error => res.status(400).json({ error }));
};
