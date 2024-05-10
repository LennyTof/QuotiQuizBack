const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/},
  username: { type: String, required: true, unique: true, minLength: 3, maxLength: 10 },
  password: { type: String, required: true, minLength: 5 },
  roles: { type: String, default: 'user'},
  scores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Score'}],
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
