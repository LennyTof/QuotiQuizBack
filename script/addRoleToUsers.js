const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/user');

//utilisé pour rajouter le champs role aux utilisateurs existants

mongoose.connect(config.mongoURI)
  .then(() => {
    console.log('Connexion à MongoDB réussie !')
    addRoleToUsers();
  })
  .catch(() => console.log('Connexion à MongoDB échouée !'));

  const addRoleToUsers = async () => {
    try {
      const results = await User.updateMany(
        { quizCompleted: { $exists: false } },
        { $set: { quizCompleted: false } }
      );
      console.log('Update Results:', results);
      if (!results.acknowledged) {
        console.log('No documents were updated. Check if the condition `{ role: { $exists: false } }` is correct and applicable.');
      }
    } catch (error) {
      console.error('Error updating users:', error);
    } finally {
      mongoose.disconnect();
    }
  };
