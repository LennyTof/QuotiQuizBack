const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = (req, res, next) => {
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

exports.updateUser = (req, res, next) => {
  const userId = req.params.userId;
  const updateFields = req.body;

  User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true })
    .then(updateUser => {
      res.status(200).json(updateUser);
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

exports.findOneUser = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, 'RANDOM_TOKEN_SECRET', (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ error: 'Token invalide' });
    }
    const userId = decodedToken.userId;
    User.findOne({ _id: userId })
      .then(user => {
        if (user) {
          res.status(200).json(user);
        } else {
          res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
      })
      .catch(error => {
        res.status(500).json({ error: error.message });
      });
  });
};

exports.deleteUser = (req, res, next) => {
  const userId = req.params.id;
  User.findByIdAndDelete(userId)
    .then(() => res.status(200).json({ message: "Compte supprimé"}))
    .catch(error => res.status(400).json({ error }));
};
