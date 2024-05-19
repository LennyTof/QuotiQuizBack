const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Quiz = require('../models/quiz');
const UsedQuiz = require('../models/usedQuiz');
const quizCtrl = require('../controllers/quiz');

router.get('/daily', async (req, res) => {
  try {
    // Récupére tous les quiz utilisés et stock les id
    const allUsedQuizzes = await UsedQuiz.find({});
    const usedQuizIds = allUsedQuizzes.flatMap(record => record.quizIds);

    // Trouve tous les quiz qui n'ont pas leur id stocké
    const availableQuizzes = await Quiz.find({ _id: { $nin: usedQuizIds } });

    if (availableQuizzes.length === 0) {
      return res.status(404).json({ message: "Tous les quiz disponibles ont été utilisés." });
    }

    // Choisi un quiz au hasard
    const randomQuiz = availableQuizzes[Math.floor(Math.random() * availableQuizzes.length)];

    // Ajoute l'ID du quiz sélectionné à l'array des quiz utilisés
    UsedQuiz.updateOne({}, { $push: { quizIds: randomQuiz._id } }, { upsert: true })
      .then(() => {
        res.json(randomQuiz);
      })
      .catch(error => {
        console.error("Erreur lors de l'ajout du quiz utilisé :", error);
        res.status(500).json({ error: "Impossible d'ajouter le quiz utilisé" });
      });
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
