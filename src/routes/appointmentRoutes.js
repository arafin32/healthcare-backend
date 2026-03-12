const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createAppointmentValidator, updateAppointmentValidator } = require('../validators/appointmentValidator');

// Patient routes
router.post('/', authMiddleware, roleMiddleware('patient'), validate(createAppointmentValidator), appointmentController.createAppointment);

// Common routes
router.get('/my-appointments', authMiddleware, appointmentController.getMyAppointments);
router.get('/:id', authMiddleware, appointmentController.getAppointmentById);
router.put('/:id', authMiddleware, validate(updateAppointmentValidator), appointmentController.updateAppointment);

// Admin routes
router.get('/', authMiddleware, roleMiddleware('admin'), appointmentController.getAllAppointments);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), appointmentController.deleteAppointment);

module.exports = router;