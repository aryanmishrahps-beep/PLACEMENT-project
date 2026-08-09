const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, StudentProfile, Analytics } = require('../models');

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: '1d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, batch } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      department: department || null,
      batch: batch || null,
      streak: 1,
      lastActive: new Date().toISOString().split('T')[0]
    });

    if (user.role === 'student') {
      await StudentProfile.create({ userId: user.id, branch: department });
      await Analytics.create({ userId: user.id });
    }

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        batch: user.batch,
        streak: user.streak,
        skillPoints: user.skillPoints,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // Update streak and last active
    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.lastActive;
    let newStreak = user.streak || 0;

    if (lastActive) {
      const diff = (new Date(today) - new Date(lastActive)) / (1000 * 60 * 60 * 24);
      if (diff === 1) newStreak += 1;
      else if (diff > 1) newStreak = 1;
    } else {
      newStreak = 1;
    }

    user.streak = newStreak;
    user.lastActive = today;
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        batch: user.batch,
        streak: user.streak,
        skillPoints: user.skillPoints,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        batch: user.batch,
        streak: user.streak,
        skillPoints: user.skillPoints,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
