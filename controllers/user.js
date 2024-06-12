const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Score = require('../models/score');
const mailer = require('../config/mailer');
const moment = require('moment-timezone');
const jwtSecret = process.env.JWT_SECRET;


exports.signup = async (req, res, next) => {
  const { password, passwordConfirmation, email, username } = req.body;

  if (!email || !username || !password || !passwordConfirmation) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  if (password !== passwordConfirmation) {
    return res.status(401).json({ message: 'Les mots de passe sont différents' });
  }

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Ce pseudo est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      username,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: "Utilisateur créé !" });
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    res.status(500).json({ message: "Une erreur interne est survenue" });
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
            roles: user.roles,
            token: jwt.sign(
              { userId: user._id },
              jwtSecret,
              { expiresIn: '7d' }
            )
          });
        })
        .catch(error => res.status(500).json({ message: "Une erreur interne est survenue" }));
    })
    .catch(error => res.status(500).json({ message: "Une erreur interne est survenue" }));
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
      return res.status(500).json({ message: "Une erreur interne est survenue" });
    }
  }

  User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true })
    .then(updateUser => {
      res.status(200).json(updateUser);
    })
    .catch(error => {
      res.status(500).json({ message: "Une erreur interne est survenue" });
    });
};

exports.findOneUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, jwtSecret);
    const userId = decodedToken.userId;

    const user = await User.findById(userId).populate('scores');

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const userWithScores = {
      _id: user._id,
      email: user.email,
      username: user.username,
      roles: user.roles,
      scores: user.scores.map(score => ({
        value: score.value,
        date: score.date,
        quizDetails: score.quizDetails
      }))
    };

    res.status(200).json(userWithScores);
  } catch (error) {
    res.status(500).json({ message: "Une erreur interne est survenue" });
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
    const decodedToken = jwt.verify(token, jwtSecret);
    const userId = decodedToken.userId;
    const { score, quizDetails } = req.body;
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    };

    // si l'utilisateur a plus de 30 scores, supprime le plus ancien
    if (user.scores.length >= 30) {
      const oldestScore = user.scores.reduce((oldest, current) => {
        return new Date(current.date) < new Date(oldest.date) ? current : oldest;
      });
      await Score.findByIdAndDelete(oldestScore._id);
      user.scores = user.scores.filter(score => score._id.toString() !== oldestScore._id.toString());
    }

    const newScore = new Score({
      value: score,
      user: userId,
      quizDetails: quizDetails
    });
    await newScore.save()
    user.scores.push(newScore);
    await user.save();
    res.status(200).json({ message: 'Nouveau score enregistré !'});
  } catch (error) {
    res.status(500).json({ message: "Une erreur interne est survenue" });
  }
};

exports.getDailyScores = async (req, res) => {
  const startOfDay = moment().tz('Europe/Paris').startOf('day').toDate();
  const endOfDay = moment().tz('Europe/Paris').endOf('day').toDate();

  try {
    const dailyScores = await Score.find({
      date: { $gte: startOfDay, $lt: endOfDay }
    })
    .populate('user', 'username')
    .sort({ value: -1 })
    .exec();
    res.json(dailyScores);
  }catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des scores journaliers" });
  }
};

exports.completeQuiz = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, jwtSecret);
    const userId = decodedToken.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json ({ error: "Utilisateur non trouvé"});
    }

    user.quizCompleted = true;

    await user.save();

    res.status(200).json({ message: 'Quiz complété', quizCompleted: user.quizCompleted });
  } catch (error) {
    res.status(500).json({ message: "Une erreur interne est survenue" });
  }
};

exports.getCompletedQuizStatus = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, jwtSecret);
    const userId = decodedToken.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.status(200).json({ quizCompleted: user.quizCompleted });
  } catch (error) {
    res.status(500).json({ message: "Une erreur interne est survenue" });
  }
};


exports.sendResetPasswordEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email:req.body.email });
    if (!user) {
      return res.status(404).send({ message: "Aucun utilisateur trouvé avec cet email."});
    }

    function generateOTP() {
      const otpLength = 6;
      let newOtp = '';
      for(let i = 0; i < otpLength; i++) {
        newOtp += Math.floor(Math.random() * 10);
      }
      return newOtp
    }

    const otp = generateOTP();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save()

    const mailOptions = {
      from: process.env.BREVO_USER,
      to: user.email,
      subject: 'Réinitialisation du mot de passe',
      text: `Ton code de réinitialisation est: ${otp} ! Utilise le vite avant qu'il expire sur QuotiQuiz !`
    };

    await mailer.sendMail(mailOptions);

    res.status(200).send({ message: "Email envoyé."})
  } catch (error) {
    console.error('Error in sendResetPasswordEmail:', error)
    res.status(500).send({ message: "Erreur serveur" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send({ message: "Token non valide ou expiré." });
    };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save()

    res.status(200).send({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    res.status(500).send({ message: "Erreur serveur" });
  }
}
