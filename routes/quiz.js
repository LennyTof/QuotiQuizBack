const express = require('express');
const Quiz = require('../models/quiz');
const quizCtrl = require('../controllers/quiz');
const router = express.Router();

router.get('/random', async (req, res) => {
  try {
    const randomQuiz = await Quiz.aggregate([{ $sample: { size: 1 } }]);

    if (!randomQuiz || randomQuiz.length === 0) {
      return res.status(404).json({ message: "Aucun qui trouvé."});
    };

    res.json(randomQuiz[0]);
  } catch (error) {
    console.error("Erreur durant la récupération du Quiz aléatoire :", error);
    res.status(500).json({ error: "Impossiblie de récupérer un quiz"});
  };
});

router.get('/', quizCtrl.findAllQuiz);
router.post('/', quizCtrl.createQuiz);
router.get('/:id', quizCtrl.findOneQuiz);
router.delete('/:id', quizCtrl.deleteQuiz);
router.put('/:id', quizCtrl.updateQuiz);


module.exports = router;
