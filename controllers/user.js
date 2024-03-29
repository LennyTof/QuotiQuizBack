const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Score = require('../models/score');
const user = require('../models/user');

exports.signup = (req, res, next) => {
  let { password, passwordConfirmation, ...updateFields } = req.body;
  const isMatch = password === passwordConfirmation

  if (isMatch) {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          username: req.body.username,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: "utilisateur créé !" }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  } else {
    return res.status(401).json({ message: 'Les mot de passe sont différents'});
  }
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrecte'});
      };
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrecte'});
          };
          res.status(200).json({
            userId: user._id,
            username: user.username,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.findAllUser = (req, res, next) => {
  User.find()
   .then(users => res.status(200).json(users))
   .catch(error => res.status(400).json({error}));
};

exports.updateUser = async (req, res, next) => {
  const userId = req.params.userId;
  let { password, oldPassword, ...updateFields } = req.body;

  if (password && oldPassword) {
    try {
      const user = await User.findById(userId);
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message : "L'ancien mot de passe est incorrect."})
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true })
    .then(updateUser => {
      res.status(200).json(updateUser);
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

exports.findOneUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;

    const user = await User.findById(userId).populate('scores');

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const userWithScores = {
      _id: user._id,
      email: user.email,
      username: user.username,
      scores: user.scores.map(score => ({
        value: score.value,
        date: score.date
      }))
    };

    res.status(200).json(userWithScores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = (req, res, next) => {
  const userId = req.params.id;
  User.findByIdAndDelete(userId)
    .then(() => res.status(200).json({ message: "Compte supprimé"}))
    .catch(error => res.status(400).json({ error }));
};

exports.saveUserScore = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;
    const { score } = req.body;
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    };
    const newScore = new Score({
      value: score,
      user: userId,
    });
    await newScore.save()
    user.scores.push(newScore);
    await user.save();
    res.status(200).json({ message: 'Nouveau score enregistré !'});
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getDailyScores = async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const dailyScores = await Score.find({
      date: { $gte: startOfDay, $lt: endOfDay }
    })
    .populate('user', 'username')
    .sort({ value: -1 })
    .exec();
    res.json(dailyScores);
  }catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des scores journaliers", error: error});
  }
};
