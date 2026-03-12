const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  medications: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array of medication objects with name, dosage, frequency, duration'
  },
  diagnosis: {
    type: DataTypes.TEXT
  },
  instructions: {
    type: DataTypes.TEXT
  },
  prescriptionDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active'
  },
  validUntil: {
    type: DataTypes.DATEONLY
  }
}, {
  tableName: 'prescriptions',
  timestamps: true
});

module.exports = Prescription;