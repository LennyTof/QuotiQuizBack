module.exports = (req, res, next) => {

  if (req.user && req.user.roles === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Accès refusé: vous n'avez pas les droits nécessaires." });
  }
};
