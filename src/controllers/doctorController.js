const { Doctor, User, Appointment, Patient, Prescription } = require('../models');
const ResponseHelper = require('../utils/responseHelper');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class DoctorController {
  // Get doctor profile
  async getProfile(req, res) {
    try {
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id },
        include: [{ model: User, as: 'user', attributes: ['email', 'isActive'] }]
      });

      if (!doctor) {
        return ResponseHelper.notFound(res, 'Doctor profile not found');
      }

      return ResponseHelper.success(res, doctor);
    } catch (error) {
      logger.error('Get doctor profile error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Update doctor profile
  async updateProfile(req, res) {
    try {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });

      if (!doctor) {
        return ResponseHelper.notFound(res, 'Doctor profile not found');
      }

      const updatedDoctor = await doctor.update(req.body);

      logger.info(`Doctor profile updated: ${doctor.id}`);
      return ResponseHelper.success(res, updatedDoctor, 'Profile updated successfully');
    } catch (error) {
      logger.error('Update doctor profile error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Get doctor dashboard
  async getDashboard(req, res) {
    try {
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return ResponseHelper.notFound(res, 'Doctor not found');
      }

      // Get today's appointments
      const today = new Date();
      const todayAppointments = await Appointment.findAll({
        where: { 
          doctorId: doctor.id,
          appointmentDate: today.toISOString().split('T')[0],
          status: { [Op.in]: ['pending', 'confirmed'] }
        },
        include: [{ model: Patient, as: 'patient' }],
        order: [['appointmentTime', 'ASC']]
      });

      // Get upcoming appointments
      const upcomingAppointments = await Appointment.findAll({
        where: { 
          doctorId: doctor.id,
          appointmentDate: { [Op.gt]: today.toISOString().split('T')[0] },
          status: { [Op.in]: ['pending', 'confirmed'] }
        },
        include: [{ model: Patient, as: 'patient' }],
        order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']],
        limit: 5
      });

      // Get recent patients
      const recentPatients = await Appointment.findAll({
        where: { 
          doctorId: doctor.id,
          status: 'completed'
        },
        include: [{ model: Patient, as: 'patient' }],
        order: [['appointmentDate', 'DESC']],
        limit: 5
      });

      return ResponseHelper.success(res, {
        doctor,
        todayAppointments,
        upcomingAppointments,
        recentPatients
      });
    } catch (error) {
      logger.error('Get doctor dashboard error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Get all doctors
  async getAllDoctors(req, res) {
    try {
      const { page = 1, limit = 10, specialization = '', search = '' } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (specialization) {
        whereClause.specialization = { [Op.iLike]: `%${specialization}%` };
      }
      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { department: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: doctors } = await Doctor.findAndCountAll({
        where: whereClause,
        include: [{ model: User, as: 'user', attributes: ['email', 'isActive'] }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      return ResponseHelper.success(res, {
        doctors,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      logger.error('Get all doctors error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Get doctor by ID
  async getDoctorById(req, res) {
    try {
      const { id } = req.params;

      const doctor = await Doctor.findByPk(id, {
        include: [{ model: User, as: 'user', attributes: ['email', 'isActive'] }]
      });

      if (!doctor) {
        return ResponseHelper.notFound(res, 'Doctor not found');
      }

      return ResponseHelper.success(res, doctor);
    } catch (error) {
      logger.error('Get doctor by ID error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }
}

module.exports = new DoctorController();