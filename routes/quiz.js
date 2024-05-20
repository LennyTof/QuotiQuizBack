const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Quiz = require('../models/quiz');
const UsedQuiz = require('../models/usedQuiz');
const DailyQuiz = require('../models/dailyQuiz');
const quizCtrl = require('../controllers/quiz');

router.get('/daily', async (req, res) => {
  try {
    const dailyQuiz = await DailyQuiz.findOne().populate('quizIds');

    if (!dailyQuiz) {
      return res.status(404).json({ message: "Aucun quiz quotidien disponible." });
    }

    const randomQuestionIndex = Math.floor(Math.random() * dailyQuiz.quizIds.length);
    const randomQuestionId = dailyQuiz.quizIds[randomQuestionIndex];

    // Rechercher la question correspondante dans la base de données
    const randomQuestion = await Quiz.findById(randomQuestionId);

    if (!randomQuestion) {
      return res.status(404).json({ message: "Question introuvable dans la base de données." });
    }

    res.json(randomQuestion);
  } catch (error) {
    console.error("Erreur durant la récupération du quiz du jour :", error);
    res.status(500).json({ error: "Impossible de récupérer le quiz du jour" });
  }
});

// routes pour les questions proposées par les utilisateurs
router.get('/asked', auth, isAdmin, quizCtrl.findAllAskedQuiz);
router.post('/asked', quizCtrl.createAskedQuiz);
router.get('/asked/:id', quizCtrl.findOneAskedQuiz);
router.delete('/asked/:id', auth, isAdmin, quizCtrl.deleteAskedQuiz);
router.put('/asked/:id', quizCtrl.updateAskedQuiz);

router.get('/', auth, isAdmin, quizCtrl.findAllQuiz);
router.post('/', auth, isAdmin, quizCtrl.createQuiz);
router.get('/:id', quizCtrl.findOneQuiz);
router.delete('/:id', auth, isAdmin, quizCtrl.deleteQuiz);
router.put('/:id', auth, isAdmin, quizCtrl.updateQuiz);

module.exports = router;
