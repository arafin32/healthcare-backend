const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING
  },
  qualification: {
    type: DataTypes.STRING
  },
  experience: {
    type: DataTypes.INTEGER
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2)
  },
  availability: {
    type: DataTypes.JSON,
    comment: 'Weekly availability schedule'
  },
  profileImage: {
    type: DataTypes.STRING
  },
  bio: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'doctors',
  timestamps: true
});

module.exports = Doctor;