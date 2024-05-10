const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const quizRoutes = require('./routes/quiz');
const userRoutes = require('./routes/user');
const app = express();


mongoose.connect(config.mongoURI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

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


module.exports = app;
