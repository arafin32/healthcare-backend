const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Doctor routes
router.get('/profile', authMiddleware, roleMiddleware('doctor'), doctorController.getProfile);
router.put('/profile', authMiddleware, roleMiddleware('doctor'), doctorController.updateProfile);
router.get('/dashboard', authMiddleware, roleMiddleware('doctor'), doctorController.getDashboard);

// Public/Patient accessible routes
router.get('/', doctorController.getAllDoctors);
router.get('/:id', authMiddleware, doctorController.getDoctorById);

module.exports = router;