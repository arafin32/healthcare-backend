const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createPrescriptionValidator, updatePrescriptionValidator } = require('../validators/prescriptionValidator');

// Doctor routes
router.post('/', authMiddleware, roleMiddleware('doctor'), validate(createPrescriptionValidator), prescriptionController.createPrescription);
router.put('/:id', authMiddleware, roleMiddleware('doctor'), validate(updatePrescriptionValidator), prescriptionController.updatePrescription);
router.get('/patient/:patientId', authMiddleware, roleMiddleware('doctor', 'admin'), prescriptionController.getPatientPrescriptions);

// Patient routes
router.get('/my-prescriptions', authMiddleware, roleMiddleware('patient'), prescriptionController.getMyPrescriptions);

// Common routes
router.get('/:id', authMiddleware, prescriptionController.getPrescriptionById);

module.exports = router;