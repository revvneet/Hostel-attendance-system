const express = require('express');
const router = express.Router();
const { login, changePassword, uploadProfilePicture, deleteProfilePicture } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const handleUpload = (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
};

router.post('/login', login);
router.post('/change-password', authMiddleware, changePassword);
router.post('/upload-profile-picture', authMiddleware, handleUpload, uploadProfilePicture);
router.delete('/profile-picture', authMiddleware, deleteProfilePicture);

module.exports = router;
