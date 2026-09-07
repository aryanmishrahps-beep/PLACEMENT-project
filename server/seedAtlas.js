require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Fix Windows DNS SRV lookup for Atlas

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedMongo = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log('Connecting to MongoDB Atlas at:', uri.split('@')[1]);

    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas successfully!');

    // Check if test user exists
    const existing = await User.findOne({ email: 'aryan@example.com' });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        name: 'Aryan Mishra',
        email: 'aryan@example.com',
        password: hashedPassword,
        role: 'admin',
        department: 'CSE',
        batch: '2024-2028',
        streak: 5,
        skillPoints: 100,
        lastActive: new Date().toISOString().split('T')[0]
      });
      await user.save();
      console.log('User created in Atlas DB:', user.name, '(', user.email, ')');
    } else {
      console.log('User already exists in Atlas DB:', existing.email);
    }

    const allUsers = await User.find({}, '-password').lean();
    console.log('\n================ USERS IN ATLAS ================');
    console.table(allUsers.map(u => ({
      ID: u._id.toString(),
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Department: u.department,
      Streak: u.streak
    })));
    console.log('================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('MongoDB Atlas Connection Error:', error.message);
    process.exit(1);
  }
};

seedMongo();
