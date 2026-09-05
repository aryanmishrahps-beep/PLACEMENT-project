const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Analytics = sequelize.define('Analytics', {
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
  progress: {
    type: DataTypes.FLOAT, // e.g., percentage completion of courses
    defaultValue: 0,
  },
  learningGraph: {
    type: DataTypes.JSON, // Activity timeline
    allowNull: true,
  },
  placementReadiness: {
    type: DataTypes.FLOAT, // Score out of 100 based on various metrics
    defaultValue: 0,
  }
}, {
  timestamps: true,
});

module.exports = Analytics;
