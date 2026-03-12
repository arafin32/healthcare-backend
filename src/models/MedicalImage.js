const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedicalImage = sequelize.define('MedicalImage', {
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
  imageType: {
    type: DataTypes.ENUM('X-ray', 'MRI', 'CT', 'Ultrasound', 'Other'),
    allowNull: false
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bodyPart: {
    type: DataTypes.STRING
  },
  captureDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  findings: {
    type: DataTypes.TEXT
  },
  uploadedBy: {
    type: DataTypes.UUID,
    comment: 'User ID who uploaded the image'
  }
}, {
  tableName: 'medical_images',
  timestamps: true
});

module.exports = MedicalImage;