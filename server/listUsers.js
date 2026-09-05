require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const listUsers = async () => {
  try {
    let uri = process.env.MONGO_URI;
    if (!uri || uri.includes('your_mongodb_atlas_uri')) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }
    await mongoose.connect(uri);
    
    const users = await User.find({}, '-password').lean();
    console.log('\n================ REGISTERED USERS ================');
    if (users.length === 0) {
      console.log('No users found in database yet.');
    } else {
      console.table(users.map(u => ({
        ID: u._id.toString(),
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Department: u.department || 'N/A',
        Streak: u.streak,
        LastActive: u.lastActive || 'N/A'
      })));
    }
    console.log('==================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    process.exit(1);
  }
};

listUsers();
