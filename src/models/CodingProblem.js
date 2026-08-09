const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CodingProblem = sequelize.define('CodingProblem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  statement: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
  },
  tags: {
    type: DataTypes.JSON, // Array of strings
    allowNull: true,
  },
  testCases: {
    type: DataTypes.JSON, // Array of { input: string, output: string }
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = CodingProblem;
