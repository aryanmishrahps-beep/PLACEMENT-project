const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  modules: {
    type: DataTypes.JSON, // Array of objects
    allowNull: true,
  },
  videos: {
    type: DataTypes.JSON, // Array of URLs/Metadata
    allowNull: true,
  },
  notes: {
    type: DataTypes.JSON, // Array of URLs
    allowNull: true,
  },
  quizzes: {
    type: DataTypes.JSON, // Array of quiz IDs or metadata
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = Course;
