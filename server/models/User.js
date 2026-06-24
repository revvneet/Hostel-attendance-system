const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: false }, // Keeping for backwards compatibility
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  hostelType: { type: String, enum: ['boys', 'girls'], required: true },
  profilePicture: { type: String, default: '' },
  role: { type: String, default: 'warden' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
