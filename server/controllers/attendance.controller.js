const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// Normalize date to midnight UTC
const normalizeDate = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// GET /api/attendance?date=YYYY-MM-DD
exports.getAttendance = async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const date = normalizeDate(dateStr);

    const students = await Student.find({}).sort({ floor: 1, roomNo: 1, bed: 1 });
    const records = await Attendance.find({ date });

    // Map studentId -> attendance record
    const recordMap = {};
    records.forEach(r => { recordMap[r.studentId.toString()] = r; });

    // Merge
    const merged = students.map(s => {
      const record = recordMap[s._id.toString()];
      return {
        _id: s._id,
        name: s.name,
        enrollmentNo: s.enrollmentNo,
        phoneNo: s.phoneNo,
        parentPhone: s.parentPhone,
        floor: s.floor,
        roomNo: s.roomNo,
        roomType: s.roomType,
        bed: s.bed,
        photoPath: s.photoPath,
        status: record ? record.status : 'absent',
        leaveStart: record ? record.leaveStart : null,
        leaveEnd: record ? record.leaveEnd : null,
        attendanceId: record ? record._id : null,
        markedAt: record ? record.markedAt : null,
      };
    });

    // Group by floor -> room
    const grouped = {};
    merged.forEach(s => {
      if (!grouped[s.floor]) grouped[s.floor] = {};
      if (!grouped[s.floor][s.roomNo]) {
        grouped[s.floor][s.roomNo] = {
          roomNo: s.roomNo,
          roomType: s.roomType,
          floor: s.floor,
          students: [],
        };
      }
      grouped[s.floor][s.roomNo].students.push(s);
    });

    res.json({ date: dateStr, grouped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/attendance/:studentId
exports.markAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, leaveStart, leaveEnd } = req.body;

    if (!['present', 'absent', 'leave'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const today = normalizeDate(new Date().toISOString().split('T')[0]);

    const update = {
      status,
      markedAt: new Date(),
      leaveStart: status === 'leave' ? leaveStart : null,
      leaveEnd: status === 'leave' ? leaveEnd : null,
    };

    const record = await Attendance.findOneAndUpdate(
      { studentId, date: today },
      { $set: update },
      { new: true, upsert: true }
    );

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
