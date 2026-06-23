const mongoose = require('mongoose');

const AttendanceHistorySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'leave'], default: 'absent' },
  leaveStart: { type: Date },
  leaveEnd: { type: Date },
  archivedAt: { type: Date, default: Date.now },
});

AttendanceHistorySchema.index({ studentId: 1, date: 1 });
AttendanceHistorySchema.index({ date: 1 });

module.exports = mongoose.model('AttendanceHistory', AttendanceHistorySchema);
