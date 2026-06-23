const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  enrollmentNo: { type: String, required: true, unique: true },
  phoneNo: { type: String },
  parentPhone: { type: String },
  floor: { type: Number, required: true, min: 1, max: 4 },
  roomNo: { type: String, required: true },
  roomType: { type: String, enum: ['sharing', 'single'], default: 'sharing' },
  bed: { type: String, enum: ['A', 'B', 'C', 'D'] },
  photoPath: { type: String, default: 'uploads/photos/avatar.jpg' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Student', StudentSchema);
