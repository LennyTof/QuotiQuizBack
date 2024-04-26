const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Quiz = require('../models/quiz');
const quizCtrl = require('../controllers/quiz');

router.get('/random', async (req, res) => {
  try {
    const randomQuiz = await Quiz.aggregate([{ $sample: { size: 1 } }]);

    if (!randomQuiz || randomQuiz.length === 0) {
      return res.status(404).json({ message: "Aucun qui trouvé."});
    };

    res.json(randomQuiz[0]);
  } catch (error) {
    console.error("Erreur durant la récupération du Quiz aléatoire :", error);
    res.status(500).json({ error: "Impossible de récupérer un quiz"});
  };
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
