const { Prescription, Patient, Doctor } = require('../models');
const ResponseHelper = require('../utils/responseHelper');
const logger = require('../utils/logger');

class PrescriptionController {
  // Create prescription (Doctor only)
  async createPrescription(req, res) {
    try {
      const { patientId, medications, diagnosis, instructions, validUntil } = req.body;

      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor) {
        return ResponseHelper.forbidden(res, 'Only doctors can create prescriptions');
      }

      const patient = await Patient.findByPk(patientId);
      if (!patient) {
        return ResponseHelper.notFound(res, 'Patient not found');
      }

      const prescription = await Prescription.create({
        patientId,
        doctorId: doctor.id,
        medications,
        diagnosis,
        instructions,
        validUntil,
        prescriptionDate: new Date()
      });

      const fullPrescription = await Prescription.findByPk(prescription.id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: Doctor, as: 'doctor' }
        ]
      });

      logger.info(`Prescription created: ${prescription.id}`);
      return ResponseHelper.success(res, fullPrescription, 'Prescription created successfully', 201);
    } catch (error) {
      logger.error('Create prescription error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Get my prescriptions
  async getMyPrescriptions(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient) {
        return ResponseHelper.notFound(res, 'Patient profile not found');
      }

      const whereClause = { patientId: patient.id };
      if (status) {
        whereClause.status = status;
      }

      const { count, rows: prescriptions } = await Prescription.findAndCountAll({
        where: whereClause,
        include: [{ model: Doctor, as: 'doctor' }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['prescriptionDate', 'DESC']]
      });

      return ResponseHelper.success(res, {
        prescriptions,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      logger.error('Get my prescriptions error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Get prescription by ID
  async getPrescriptionById(req, res) {
    try {
      const { id } = req.params;

      const prescription = await Prescription.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: Doctor, as: 'doctor' }
        ]
      });

      if (!prescription) {
        return ResponseHelper.notFound(res, 'Prescription not found');
      }

      // Authorization check
      if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ where: { userId: req.user.id } });
        if (prescription.patientId !== patient.id) {
          return ResponseHelper.forbidden(res);
        }
      } else if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
        if (prescription.doctorId !== doctor.id) {
          return ResponseHelper.forbidden(res);
        }
      }

      return ResponseHelper.success(res, prescription);
    } catch (error) {
      logger.error('Get prescription by ID error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Update prescription (Doctor only)
  async updatePrescription(req, res) {
    try {
      const { id } = req.params;

      const prescription = await Prescription.findByPk(id);
      if (!prescription) {
        return ResponseHelper.notFound(res, 'Prescription not found');
      }

      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (prescription.doctorId !== doctor.id) {
        return ResponseHelper.forbidden(res, 'You can only update your own prescriptions');
      }

      const updatedPrescription = await prescription.update(req.body);

      logger.info(`Prescription updated: ${id}`);
      return ResponseHelper.success(res, updatedPrescription, 'Prescription updated successfully');
    } catch (error) {
      logger.error('Update prescription error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Get patient prescriptions (Doctor)
  async getPatientPrescriptions(req, res) {
    try {
      const { patientId } = req.params;

      const patient = await Patient.findByPk(patientId);
      if (!patient) {
        return ResponseHelper.notFound(res, 'Patient not found');
      }

      const prescriptions = await Prescription.findAll({
        where: { patientId },
        include: [{ model: Doctor, as: 'doctor' }],
        order: [['prescriptionDate', 'DESC']]
      });

      return ResponseHelper.success(res, prescriptions);
    } catch (error) {
      logger.error('Get patient prescriptions error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }
}

module.exports = new PrescriptionController();