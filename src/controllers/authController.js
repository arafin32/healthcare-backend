const { User, Patient, Doctor, Admin } = require('../models');
const { generateToken, generateRefreshToken } = require('../utils/jwtHelper');
const ResponseHelper = require('../utils/responseHelper');
const logger = require('../utils/logger');
const sequelize = require('../config/database');

class AuthController {
  // Register new user
  async register(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { email, password, role, firstName, lastName, phoneNumber, ...otherData } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        await transaction.rollback();
        return ResponseHelper.error(res, 'Email already registered', 409);
      }

      // Create user
      const user = await User.create({
        email,
        password,
        role
      }, { transaction });

      // Create role-specific profile
      let profile;
      if (role === 'patient') {
        profile = await Patient.create({
          userId: user.id,
          firstName,
          lastName,
          phoneNumber,
          dateOfBirth: otherData.dateOfBirth,
          gender: otherData.gender,
          address: otherData.address || null,
          bloodGroup: otherData.bloodGroup || null
        }, { transaction });
      } else if (role === 'doctor') {
        profile = await Doctor.create({
          userId: user.id,
          firstName,
          lastName,
          phoneNumber,
          specialization: otherData.specialization,
          licenseNumber: otherData.licenseNumber,
          department: otherData.department || null,
          qualification: otherData.qualification || null
        }, { transaction });
      } else if (role === 'admin') {
        profile = await Admin.create({
          userId: user.id,
          firstName,
          lastName,
          phoneNumber,
          department: otherData.department || null
        }, { transaction });
      }

      await transaction.commit();

      // Generate tokens
      const token = generateToken({ id: user.id, role: user.role });
      const refreshToken = generateRefreshToken({ id: user.id });

      logger.info(`New user registered: ${email}`);

      return ResponseHelper.success(res, {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile
        },
        token,
        refreshToken
      }, 'Registration successful', 201);

    } catch (error) {
      await transaction.rollback();
      logger.error('Registration error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ 
        where: { email },
        include: [
          { model: Patient, as: 'patientProfile' },
          { model: Doctor, as: 'doctorProfile' },
          { model: Admin, as: 'adminProfile' }
        ]
      });

      if (!user) {
        return ResponseHelper.unauthorized(res, 'Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        return ResponseHelper.forbidden(res, 'Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return ResponseHelper.unauthorized(res, 'Invalid credentials');
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      // Get profile based on role
      let profile = null;
      if (user.role === 'patient') {
        profile = user.patientProfile;
      } else if (user.role === 'doctor') {
        profile = user.doctorProfile;
      } else if (user.role === 'admin') {
        profile = user.adminProfile;
      }

      // Generate tokens
      const token = generateToken({ id: user.id, role: user.role });
      const refreshToken = generateRefreshToken({ id: user.id });

      logger.info(`User logged in: ${email}`);

      return ResponseHelper.success(res, {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile
        },
        token,
        refreshToken
      }, 'Login successful');

    } catch (error) {
      logger.error('Login error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        include: [
          { model: Patient, as: 'patientProfile' },
          { model: Doctor, as: 'doctorProfile' },
          { model: Admin, as: 'adminProfile' }
        ]
      });

      if (!user) {
        return ResponseHelper.notFound(res, 'User not found');
      }

      let profile = null;
      if (user.role === 'patient') {
        profile = user.patientProfile;
      } else if (user.role === 'doctor') {
        profile = user.doctorProfile;
      } else if (user.role === 'admin') {
        profile = user.adminProfile;
      }

      return ResponseHelper.success(res, {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        profile
      });

    } catch (error) {
      logger.error('Get profile error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  // Logout (client-side token removal)
  async logout(req, res) {
    try {
      logger.info(`User logged out: ${req.user.email}`);
      return ResponseHelper.success(res, null, 'Logout successful');
    } catch (error) {
      logger.error('Logout error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }
}

module.exports = new AuthController();