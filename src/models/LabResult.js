const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LabResult = sequelize.define('LabResult', {
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
  testName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  testType: {
    type: DataTypes.STRING
  },
  testDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  results: {
    type: DataTypes.JSON,
    comment: 'Test results as key-value pairs'
  },
  normalRange: {
    type: DataTypes.JSON,
    comment: 'Normal range values for reference'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'reviewed'),
    defaultValue: 'pending'
  },
  filePath: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT
  },
  abnormalFlags: {
    type: DataTypes.JSON,
    comment: 'Flags for abnormal results'
  }
}, {
  tableName: 'lab_results',
  timestamps: true
});

module.exports = LabResult;