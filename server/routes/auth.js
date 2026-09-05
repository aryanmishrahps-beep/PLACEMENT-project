const express = require('express');
const { register, login, getMe, getAllUsers } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.get('/users', getAllUsers);

module.exports = router;
