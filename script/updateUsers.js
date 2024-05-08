const mongoose = require('mongoose');
const config = require('../config')
const User = require('../models/user');

//utilisé pour rajouter le champs resetPasswordToken et resetPasswordExpires aux utilisateurs existants

mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

async function updateUsers() {
  try {
    const result = await User.updateMany(
      {},
      {
        $set: {
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      }
    );

    console.log('Mise à jour réussie:', result);
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
  } finally {
    mongoose.disconnect();
  }
}

updateUsers();
