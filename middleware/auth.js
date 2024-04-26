const jwt = require('jsonwebtoken');
const User = require('../models/user');


module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Aucun utilisateur trouvé');
    }

    console.log("Utilisateur connecté:", user);
    req.user = user;
    next()
  } catch(error) {
    res.status(401).json({ message: "Unauthorized:" + error.message });
  };
};
