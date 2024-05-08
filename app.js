const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const config = require('./config');
const cors = require('cors');
require('dotenv').config();
const quizRoutes = require('./routes/quiz');
const userRoutes = require('./routes/user');
const app = express();
const router = express.Router();


mongoose.connect(config.mongoURI,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));

app.use(express.json());


app.use('/api/quiz', quizRoutes);
app.use('/api/user', userRoutes);


module.exports = app;
