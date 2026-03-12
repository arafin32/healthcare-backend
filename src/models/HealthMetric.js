const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HealthMetric = sequelize.define('HealthMetric', {
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
  metricType: {
    type: DataTypes.ENUM('blood_pressure', 'heart_rate', 'temperature', 'weight', 'bmi', 'blood_sugar', 'oxygen_saturation', 'other'),
    allowNull: false
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recordedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT
  },
  isAbnormal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'health_metrics',
  timestamps: true
});

module.exports = HealthMetric;