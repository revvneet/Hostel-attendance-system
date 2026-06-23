const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/student.controller');

router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.post('/', upload.single('photo'), createStudent);
router.put('/:id', upload.single('photo'), updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
