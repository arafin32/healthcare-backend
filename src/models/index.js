const sequelize = require('../config/database');
const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Admin = require('./Admin');
const Appointment = require('./Appointment');
const MedicalHistory = require('./MedicalHistory');
const Prescription = require('./Prescription');
const LabResult = require('./LabResult');
const MedicalImage = require('./MedicalImage');
const Medication = require('./Medication');
const HealthMetric = require('./HealthMetric');

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasOne(Patient, { foreignKey: 'userId', as: 'patientProfile' });
  User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctorProfile' });
  User.hasOne(Admin, { foreignKey: 'userId', as: 'adminProfile' });

  Patient.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Admin.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Patient associations
  Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
  Patient.hasMany(MedicalHistory, { foreignKey: 'patientId', as: 'medicalHistories' });
  Patient.hasMany(Prescription, { foreignKey: 'patientId', as: 'prescriptions' });
  Patient.hasMany(LabResult, { foreignKey: 'patientId', as: 'labResults' });
  Patient.hasMany(MedicalImage, { foreignKey: 'patientId', as: 'medicalImages' });
  Patient.hasMany(Medication, { foreignKey: 'patientId', as: 'medications' });
  Patient.hasMany(HealthMetric, { foreignKey: 'patientId', as: 'healthMetrics' });

  // Doctor associations
  Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });
  Doctor.hasMany(Prescription, { foreignKey: 'doctorId', as: 'prescriptions' });

  // Appointment associations
  Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
  Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

  // Prescription associations
  Prescription.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
  Prescription.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

  // Other associations
  MedicalHistory.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
  LabResult.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
  MedicalImage.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
  Medication.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
  HealthMetric.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
};

defineAssociations();

module.exports = {
  sequelize,
  User,
  Patient,
  Doctor,
  Admin,
  Appointment,
  MedicalHistory,
  Prescription,
  LabResult,
  MedicalImage,
  Medication,
  HealthMetric
};