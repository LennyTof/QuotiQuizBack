const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cron = require('node-cron');
const User = require('./models/user');
const UsedQuiz = require('./models/usedQuiz');
const DailyQuiz = require('./models/dailyQuiz');
const Quiz = require('./models/quiz');
const quizRoutes = require('./routes/quiz');
const userRoutes = require('./routes/user');
const moment = require('moment-timezone');
const { Agent } = require('https-proxy-agent');
const url = require('url');

const app = express();

const mongoURI = process.env.MONGO_URI;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

// Utiliser QuotaGuard en production
if (process.env.QUOTAGUARDSTATIC_URL) {
  const proxy = url.parse(process.env.QUOTAGUARDSTATIC_URL);
  const proxyOpts = {
    hostname: proxy.hostname,
    port: proxy.port || 80,
    auth: proxy.auth,
  };

  const proxyAgent = new Agent(proxyOpts);
  options.agent = proxyAgent;
}

mongoose.connect(mongoURI, options)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => {
    console.error(error)
    console.log('Connexion à MongoDB échouée !')
    process.exit(1);
  });

app.use(helmet());

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
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
