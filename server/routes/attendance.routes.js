const express = require('express');
const router = express.Router();
const { getAttendance, markAttendance } = require('../controllers/attendance.controller');

router.get('/', getAttendance);
router.patch('/:studentId', markAttendance);

module.exports = router;
