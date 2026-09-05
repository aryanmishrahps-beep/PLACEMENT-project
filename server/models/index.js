const sequelize = require('../config/database');

const User = require('./User');
const StudentProfile = require('./StudentProfile');
const Course = require('./Course');
const CodingProblem = require('./CodingProblem');
const Submission = require('./Submission');
const Assessment = require('./Assessment');
const Project = require('./Project');
const Company = require('./Company');
const Application = require('./Application');
const Interview = require('./Interview');
const Achievement = require('./Achievement');
const Notification = require('./Notification');
const Analytics = require('./Analytics');

// Relationships

// User <-> StudentProfile (1:1)
User.hasOne(StudentProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
StudentProfile.belongsTo(User, { foreignKey: 'userId' });

// User <-> Submission (1:M)
User.hasMany(Submission, { foreignKey: 'studentId' });
Submission.belongsTo(User, { foreignKey: 'studentId' });

// CodingProblem <-> Submission (1:M)
CodingProblem.hasMany(Submission, { foreignKey: 'problemId' });
Submission.belongsTo(CodingProblem, { foreignKey: 'problemId' });

// User <-> Project (1:M)
User.hasMany(Project, { foreignKey: 'studentId' });
Project.belongsTo(User, { foreignKey: 'studentId' });

// User <-> Application (1:M)
User.hasMany(Application, { foreignKey: 'studentId' });
Application.belongsTo(User, { foreignKey: 'studentId' });

// Company <-> Application (1:M)
Company.hasMany(Application, { foreignKey: 'companyId' });
Application.belongsTo(Company, { foreignKey: 'companyId' });

// Application <-> Interview (1:M)
Application.hasMany(Interview, { foreignKey: 'applicationId', onDelete: 'CASCADE' });
Interview.belongsTo(Application, { foreignKey: 'applicationId' });

// User <-> Achievement (1:M)
User.hasMany(Achievement, { foreignKey: 'userId' });
Achievement.belongsTo(User, { foreignKey: 'userId' });

// User <-> Notification (1:M)
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// User <-> Analytics (1:1)
User.hasOne(Analytics, { foreignKey: 'userId', onDelete: 'CASCADE' });
Analytics.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  StudentProfile,
  Course,
  CodingProblem,
  Submission,
  Assessment,
  Project,
  Company,
  Application,
  Interview,
  Achievement,
  Notification,
  Analytics
};
