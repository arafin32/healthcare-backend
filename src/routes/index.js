const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const patientRoutes = require('./patientRoutes');
const doctorRoutes = require('./doctorRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const prescriptionRoutes = require('./prescriptionRoutes');
const adminRoutes = require('./adminRoutes');

// API version 1
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/patients', patientRoutes);
router.use('/api/v1/doctors', doctorRoutes);
router.use('/api/v1/appointments', appointmentRoutes);
router.use('/api/v1/prescriptions', prescriptionRoutes);
router.use('/api/v1/admin', adminRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Temporary test route
router.post('/api/v1/test', (req, res) => {
  res.json({ success: true, message: 'TEST OK' });
});

module.exports = router;
