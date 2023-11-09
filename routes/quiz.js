const express = require('express');
const Quiz = require('../models/quiz');
const quizCtrl = require('../controllers/quiz');
const router = express.Router();

router.get('/', quizCtrl.findAllQuiz);
router.post('/', quizCtrl.createQuiz);
router.get('/:id', quizCtrl.findOneQuiz);
router.delete('/:id', quizCtrl.deleteQuiz);
router.put('/:id', quizCtrl.updateQuiz);


module.exports = router;
