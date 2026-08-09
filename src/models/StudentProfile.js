const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentProfile = sequelize.define('StudentProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  branch: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cgpa: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  skills: {
    type: DataTypes.JSON, // Array of strings
    allowNull: true,
  },
  resumeUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  placementStatus: {
    type: DataTypes.ENUM('unplaced', 'placed', 'not_interested'),
    defaultValue: 'unplaced',
  }
}, {
  timestamps: true,
});

module.exports = StudentProfile;
