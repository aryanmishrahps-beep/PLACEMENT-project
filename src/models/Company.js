const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profile: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  eligibility: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  jobRoles: {
    type: DataTypes.JSON, // Array of roles
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = Company;
