const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/', userCtrl.findAllUser);
router.get('/profil', userCtrl.findOneUser);
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.put('/update/:userId', userCtrl.updateUser);
router.delete('/:id', auth, isAdmin, userCtrl.deleteUser);

router.post('/score', userCtrl.saveUserScore);
router.get('/daily-leaderboard', userCtrl.getDailyScores);

router.post('/reset-password-email', userCtrl.sendResetPasswordEmail);
router.post('/reset-password', userCtrl.resetPassword);

// routes pour mettre à jour et vérifier si l'utilisateur a déjà répondu à un quiz dans la journée
router.post('/complete-quiz', userCtrl.completeQuiz);
router.get('/complete-status', userCtrl.getCompletedQuizStatus);

module.exports = router;
