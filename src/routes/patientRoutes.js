const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const { updateProfileValidator } = require('../validators/patientValidator');

// Patient routes
router.get('/profile', authMiddleware, roleMiddleware('patient'), patientController.getProfile);
router.put('/profile', authMiddleware, roleMiddleware('patient'), validate(updateProfileValidator), patientController.updateProfile);
router.get('/dashboard', authMiddleware, roleMiddleware('patient'), patientController.getDashboard);

// Admin/Doctor routes
router.get('/', authMiddleware, roleMiddleware('admin', 'doctor'), patientController.getAllPatients);
router.get('/:id', authMiddleware, roleMiddleware('admin', 'doctor'), patientController.getPatientById);

module.exports = router;