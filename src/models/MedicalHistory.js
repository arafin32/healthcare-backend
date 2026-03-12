const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedicalHistory = sequelize.define('MedicalHistory', {
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
  condition: {
    type: DataTypes.STRING,
    allowNull: false
  },
  diagnosedDate: {
    type: DataTypes.DATEONLY
  },
  status: {
    type: DataTypes.ENUM('active', 'resolved', 'chronic'),
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT
  },
  treatment: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'medical_histories',
  timestamps: true
});

module.exports = MedicalHistory;