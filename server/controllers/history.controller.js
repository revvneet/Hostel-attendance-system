const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const AttendanceHistory = require('../models/AttendanceHistory');

const normalizeDate = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// GET /api/history/dates
exports.getHistoryDates = async (req, res) => {
  try {
    const dates = await AttendanceHistory.distinct('date');
    const sorted = dates.sort((a, b) => new Date(b) - new Date(a));
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/history?date=YYYY-MM-DD
exports.getHistoryByDate = async (req, res) => {
  try {
    const dateStr = req.query.date;
    if (!dateStr) return res.status(400).json({ message: 'date query param required' });

    const date = normalizeDate(dateStr);
    const records = await AttendanceHistory.find({ date }).populate('studentId');

    const grouped = {};
    records.forEach(r => {
      const s = r.studentId;
      if (!s) return;
      const floor = s.floor;
      const roomNo = s.roomNo;
      if (!grouped[floor]) grouped[floor] = {};
      if (!grouped[floor][roomNo]) {
        grouped[floor][roomNo] = { roomNo, roomType: s.roomType, floor, students: [] };
      }
      grouped[floor][roomNo].students.push({
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
        status: r.status,
        leaveStart: r.leaveStart,
        leaveEnd: r.leaveEnd,
      });
    });

    res.json({ date: dateStr, grouped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/history/archive
exports.archiveToday = async (req, res) => {
  try {
    const today = normalizeDate(new Date().toISOString().split('T')[0]);

    // Check if already archived for today
    const existing = await AttendanceHistory.findOne({ date: today });
    if (existing) {
      return res.status(409).json({ message: 'Today already archived' });
    }

    const students = await Student.find({});
    const records = await Attendance.find({ date: today });

    const recordMap = {};
    records.forEach(r => { recordMap[r.studentId.toString()] = r; });

    const historyDocs = students.map(s => {
      const record = recordMap[s._id.toString()];
      return {
        studentId: s._id,
        date: today,
        status: record ? record.status : 'absent',
        leaveStart: record ? record.leaveStart : null,
        leaveEnd: record ? record.leaveEnd : null,
        archivedAt: new Date(),
      };
    });

    await AttendanceHistory.insertMany(historyDocs);
    res.json({ message: 'Archived successfully', count: historyDocs.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
