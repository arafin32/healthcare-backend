const { User, Patient, Doctor, Admin, Appointment, Prescription } = require('../models');
const ResponseHelper = require('../utils/responseHelper');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class AdminController {
  // Get system analytics
  async getAnalytics(req, res) {
    try {
      // Total counts
      const totalPatients = await Patient.count();
      const totalDoctors = await Doctor.count();
      const totalAppointments = await Appointment.count();
      const totalPrescriptions = await Prescription.count();

      // Appointment statistics
      const appointmentStats = await Appointment.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('status')), 'count']
        ],
        group: ['status']
      });

      // Recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentPatients = await Patient.count({
        where: {
          createdAt: { [Op.gte]: thirtyDaysAgo }
        }
      });

      const recentDoctors = await Doctor.count({
        where: {
          createdAt: { [Op.gte]: thirtyDaysAgo }
        }
      });

      // Active users
      const activeUsers = await User.count({
        where: { isActive: true }
      });

      return ResponseHelper.success(res, {
        totals: {
          patients: totalPatients,
          doctors: totalDoctors,
          appointments: totalAppointments,
          prescriptions: totalPrescriptions,
          activeUsers
        },
        appointmentStats,
        recentRegistrations: {
          patients: recentPatients,
          doctors: recentDoctors
        }
      });
    } catch (error) {
      logger.error('Get analytics error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Manage user (activate/deactivate)
  async manageUser(req, res) {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return ResponseHelper.notFound(res, 'User not found');
      }

      await user.update({ isActive });

      logger.info(`User ${userId} ${isActive ? 'activated' : 'deactivated'}`);
      return ResponseHelper.success(res, user, `User ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      logger.error('Manage user error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Delete user
  async deleteUser(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId);
      if (!user) {
        await transaction.rollback();
        return ResponseHelper.notFound(res, 'User not found');
      }

      // Delete role-specific profile
      if (user.role === 'patient') {
        await Patient.destroy({ where: { userId }, transaction });
      } else if (user.role === 'doctor') {
        await Doctor.destroy({ where: { userId }, transaction });
      } else if (user.role === 'admin') {
        await Admin.destroy({ where: { userId }, transaction });
      }

      // Delete user
      await user.destroy({ transaction });

      await transaction.commit();

      logger.info(`User deleted: ${userId}`);
      return ResponseHelper.success(res, null, 'User deleted successfully');
    } catch (error) {
      await transaction.rollback();
      logger.error('Delete user error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Get all users
  async getAllUsers(req, res) {
    try {
      const { role, isActive, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (role) {
        whereClause.role = role;
      }
      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        include: [
          { model: Patient, as: 'patientProfile' },
          { model: Doctor, as: 'doctorProfile' },
          { model: Admin, as: 'adminProfile' }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      return ResponseHelper.success(res, {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      logger.error('Get all users error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }
}

module.exports = new AdminController();