const { Patient, User, Appointment, MedicalHistory, Prescription } = require('../models');
const ResponseHelper = require('../utils/responseHelper');
const logger = require('../utils/logger');

class PatientController {
  // Get patient profile
  async getProfile(req, res) {
    try {
      const patient = await Patient.findOne({
        where: { userId: req.user.id },
        include: [{ model: User, as: 'user', attributes: ['email', 'isActive'] }]
      });

      if (!patient) {
        return ResponseHelper.notFound(res, 'Patient profile not found');
      }

      return ResponseHelper.success(res, patient);
    } catch (error) {
      logger.error('Get patient profile error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Update patient profile
  async updateProfile(req, res) {
    try {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });

      if (!patient) {
        return ResponseHelper.notFound(res, 'Patient profile not found');
      }

      const updatedPatient = await patient.update(req.body);

      logger.info(`Patient profile updated: ${patient.id}`);
      return ResponseHelper.success(res, updatedPatient, 'Profile updated successfully');
    } catch (error) {
      logger.error('Update patient profile error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Get patient dashboard data
  async getDashboard(req, res) {
    try {
      const patient = await Patient.findOne({
        where: { userId: req.user.id }
      });

      if (!patient) {
        return ResponseHelper.notFound(res, 'Patient not found');
      }

      // Get upcoming appointments
      const upcomingAppointments = await Appointment.findAll({
        where: { 
          patientId: patient.id,
          status: ['pending', 'confirmed']
        },
        include: [{ model: Doctor, as: 'doctor' }],
        order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']],
        limit: 5
      });

      // Get recent medical history
      const recentHistory = await MedicalHistory.findAll({
        where: { patientId: patient.id },
        order: [['diagnosedDate', 'DESC']],
        limit: 5
      });

      // Get active prescriptions
      const activePrescriptions = await Prescription.findAll({
        where: { 
          patientId: patient.id,
          status: 'active'
        },
        include: [{ model: Doctor, as: 'doctor' }],
        order: [['prescriptionDate', 'DESC']],
        limit: 5
      });

      return ResponseHelper.success(res, {
        patient,
        upcomingAppointments,
        recentHistory,
        activePrescriptions
      });
    } catch (error) {
      logger.error('Get patient dashboard error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Get all patients (Admin only)
  async getAllPatients(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { phoneNumber: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: patients } = await Patient.findAndCountAll({
        where: whereClause,
        include: [{ model: User, as: 'user', attributes: ['email', 'isActive'] }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      return ResponseHelper.success(res, {
        patients,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      logger.error('Get all patients error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Get patient by ID (Doctor/Admin)
  async getPatientById(req, res) {
    try {
      const { id } = req.params;

      const patient = await Patient.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['email', 'isActive'] },
          { model: MedicalHistory, as: 'medicalHistories' },
          { model: Prescription, as: 'prescriptions', include: [{ model: Doctor, as: 'doctor' }] }
        ]
      });

      if (!patient) {
        return ResponseHelper.notFound(res, 'Patient not found');
      }

      return ResponseHelper.success(res, patient);
    } catch (error) {
      logger.error('Get patient by ID error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }
}

module.exports = new PatientController();