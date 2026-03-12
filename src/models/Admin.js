const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
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
  phoneNumber: {
    type: DataTypes.STRING
  },
  department: {
    type: DataTypes.STRING
  },
  accessLevel: {
    type: DataTypes.ENUM('super_admin', 'admin', 'moderator'),
    defaultValue: 'admin'
  }
}, {
  tableName: 'admins',
  timestamps: true
});

module.exports = Admin;