const Student = require('../models/Student');

// GET /api/students — supports ?floor=&room=&name=
exports.getAllStudents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.floor) filter.floor = Number(req.query.floor);
    if (req.query.room) filter.roomNo = req.query.room;
    if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };

    const students = await Student.find(filter).sort({ floor: 1, roomNo: 1, bed: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/students/:id
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/students
exports.createStudent = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photoPath = `uploads/photos/${req.file.filename}`;
    const student = await Student.create(data);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/students/:id
exports.updateStudent = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photoPath = `uploads/photos/${req.file.filename}`;
    const student = await Student.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
