const express = require('express');
const router = express.Router();
const { getHistoryDates, getHistoryByDate, archiveToday } = require('../controllers/history.controller');

router.get('/dates', getHistoryDates);
router.get('/', getHistoryByDate);
router.post('/archive', archiveToday);

module.exports = router;
