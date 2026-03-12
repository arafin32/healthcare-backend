const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { registerValidator, loginValidator } = require('../validators/authValidator');

// Public routes
router.post('/register', validate(registerValidator), authController.register);
router.post('/login', validate(loginValidator), authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/logout', authMiddleware, authController.logout);

// in authRoutes.js
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'GET works!' });
});


module.exports = router;