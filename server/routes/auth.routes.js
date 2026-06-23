const express = require('express');
const router = express.Router();
const { login, changePassword } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
