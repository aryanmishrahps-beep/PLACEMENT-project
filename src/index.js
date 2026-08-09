require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);

const initializeDatabase = require('./config/initDb');

// Database Sync and Server Start
const PORT = process.env.PORT || 5000;

initializeDatabase()
  .then(() => {
    return sequelize.sync({ alter: true }); // Using alter to automatically update tables
  })
  .then(() => {
    console.log('Database connected and models synchronized.');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Unable to connect or sync with the database:', error);
  });

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: '🚀 Placement Portal API Backend is Live & Running!',
    endpoints: {
      health: '/health',
      auth: '/api/auth'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Placement Portal Backend is running' });
});
