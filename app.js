const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const cron = require('node-cron');
const User = require('./models/user');
const UsedQuiz = require('./models/usedQuiz');
const DailyQuiz = require('./models/dailyQuiz');
const Quiz = require('./models/quiz');
const quizRoutes = require('./routes/quiz');
const userRoutes = require('./routes/user');
const moment = require('moment-timezone');
const app = express();


mongoose.connect(config.mongoURI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(helmet());

// Configuration de CORS avec une seule URL autorisée
const allowedOrigin = process.env.CORS_ORIGIN;

const corsOptions = {
  origin: function (origin, callback) {
    if (origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(morgan('combined'));

app.use(express.json());


app.use('/api/quiz', quizRoutes);
app.use('/api/user', userRoutes);

moment.tz.setDefault('Europe/Paris')

cron.schedule('0 0 * * *', async () => { // Exécute tous les jours à minuit
  try {
    const today = moment().startOf('day');

    // Supprime les quiz qui sont stockés depuis plus de 7 jours
    await UsedQuiz.deleteMany({ date: { $lt: moment(today).subtract(7, 'days').toDate() } });

    // Supprime les quiz de la veille
    await DailyQuiz.deleteMany({});

    await User.updateMany({}, { quizCompleted: false });

    // Récupère tous les IDs des quiz utilisés les 7 derniers jours
    const recentUsedQuizzes = await UsedQuiz.find({});
    const usedQuizIds = recentUsedQuizzes.flatMap(record => record.quizIds);

    // Sélectionne 5 quiz aléatoires parmi ceux non utilisés
    const availableQuizzes = await Quiz.find({ _id: { $nin: usedQuizIds } }).limit(5);

    if (availableQuizzes.length > 0) {
      const dailyQuiz = new DailyQuiz({
        date: today,
        quizIds: availableQuizzes.map(quiz => quiz._id)
      });

      await dailyQuiz.save();
      console.log('Quiz quotidiens mis à jour.');

      // Stocke les IDs des quiz utilisés pour éviter la réutilisation pendant 7 jours
      await UsedQuiz.updateOne({}, { $push: { quizIds: { $each: dailyQuiz.quizIds } } }, { upsert: true });
    } else {
      console.log('Pas assez de quiz disponibles pour la sélection quotidienne.');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des quiz quotidiens:', error);
  }
}, {
  timezone: 'Europe/Paris'
});

module.exports = app;
