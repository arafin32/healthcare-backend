const { Appointment, Patient, Doctor, User } = require('../models');
const ResponseHelper = require('../utils/responseHelper');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class AppointmentController {
  // Create appointment
  async createAppointment(req, res) {
    try {
      const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

      // Get patient
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient) {
        return ResponseHelper.notFound(res, 'Patient profile not found');
      }

      // Check if doctor exists
      const doctor = await Doctor.findByPk(doctorId);
      if (!doctor) {
        return ResponseHelper.notFound(res, 'Doctor not found');
      }

      // Check for existing appointment at same time
      const existingAppointment = await Appointment.findOne({
        where: {
          doctorId,
          appointmentDate,
          appointmentTime,
          status: { [Op.in]: ['pending', 'confirmed'] }
        }
      });

      if (existingAppointment) {
        return ResponseHelper.error(res, 'This time slot is already booked', 409);
      }

      const appointment = await Appointment.create({
        patientId: patient.id,
        doctorId,
        appointmentDate,
        appointmentTime,
        reason,
        status: 'pending'
      });

      const fullAppointment = await Appointment.findByPk(appointment.id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: Doctor, as: 'doctor' }
        ]
      });

      logger.info(`Appointment created: ${appointment.id}`);
      return ResponseHelper.success(res, fullAppointment, 'Appointment created successfully', 201);
    } catch (error) {
      logger.error('Create appointment error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Get appointments for current user
  async getMyAppointments(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (status) {
        whereClause.status = status;
      }

      let appointments;
      if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ where: { userId: req.user.id } });
        whereClause.patientId = patient.id;
        
        appointments = await Appointment.findAndCountAll({
          where: whereClause,
          include: [{ model: Doctor, as: 'doctor' }],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']]
        });
      } else if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
        whereClause.doctorId = doctor.id;
        
        appointments = await Appointment.findAndCountAll({
          where: whereClause,
          include: [{ model: Patient, as: 'patient' }],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']]
        });
      }

      return ResponseHelper.success(res, {
        appointments: appointments.rows,
        pagination: {
          total: appointments.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(appointments.count / limit)
        }
      });
    } catch (error) {
      logger.error('Get appointments error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Get appointment by ID
  async getAppointmentById(req, res) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: Doctor, as: 'doctor' }
        ]
      });

      if (!appointment) {
        return ResponseHelper.notFound(res, 'Appointment not found');
      }

      // Authorization check
      if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ where: { userId: req.user.id } });
        if (appointment.patientId !== patient.id) {
          return ResponseHelper.forbidden(res);
        }
      } else if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
        if (appointment.doctorId !== doctor.id) {
          return ResponseHelper.forbidden(res);
        }
      }

      return ResponseHelper.success(res, appointment);
    } catch (error) {
      logger.error('Get appointment by ID error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Update appointment
  async updateAppointment(req, res) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return ResponseHelper.notFound(res, 'Appointment not found');
      }

      // Authorization check
      if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ where: { userId: req.user.id } });
        if (appointment.patientId !== patient.id) {
          return ResponseHelper.forbidden(res);
        }
        // Patients can only cancel
        if (req.body.status && req.body.status !== 'cancelled') {
          return ResponseHelper.forbidden(res, 'Patients can only cancel appointments');
        }
      } else if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
        if (appointment.doctorId !== doctor.id) {
          return ResponseHelper.forbidden(res);
        }
      }

      const updatedAppointment = await appointment.update(req.body);

      logger.info(`Appointment updated: ${id}`);
      return ResponseHelper.success(res, updatedAppointment, 'Appointment updated successfully');
    } catch (error) {
      logger.error('Update appointment error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Delete appointment
  async deleteAppointment(req, res) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return ResponseHelper.notFound(res, 'Appointment not found');
      }

      // Only admin can delete
      if (req.user.role !== 'admin') {
        return ResponseHelper.forbidden(res, 'Only admins can delete appointments');
      }

      await appointment.destroy();

      logger.info(`Appointment deleted: ${id}`);
      return ResponseHelper.success(res, null, 'Appointment deleted successfully');
    } catch (error) {
      logger.error('Delete appointment error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Get all appointments (Admin)
  async getAllAppointments(req, res) {
    try {
      const { status, page = 1, limit = 10, date } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) {
        whereClause.status = status;
      }
      if (date) {
        whereClause.appointmentDate = date;
      }

      const { count, rows: appointments } = await Appointment.findAndCountAll({
        where: whereClause,
        include: [
          { model: Patient, as: 'patient' },
          { model: Doctor, as: 'doctor' }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']]
      });

      return ResponseHelper.success(res, {
        appointments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      logger.error('Get all appointments error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }
}

module.exports = new AppointmentController();