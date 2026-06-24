const express = require('express');
const router = express.Router();
const { getWardens, deleteWarden, createWarden, updateWarden } = require('../controllers/admin.controller');

router.get('/wardens', getWardens);
router.post('/wardens', createWarden);
router.put('/wardens/:id', updateWarden);
router.delete('/wardens/:id', deleteWarden);

module.exports = router;

module.exports = router;
