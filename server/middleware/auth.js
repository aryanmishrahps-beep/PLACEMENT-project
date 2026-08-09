require('dotenv').config();

const { getAuth } = require('../config/firebase');
const { getDB } = require('../config/firestore');

/**
 * Verifies Firebase ID token and attaches user profile from Firestore to req.user.
 * Auto-creates a user document on first login.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  // Bypass for Quick Demo Login
  if (token.startsWith('mock_demo_token')) {
    const role = token.split('_').pop();
    req.user = { 
      id: `demo_${role}`, 
      name: `Demo ${role}`, 
      role: role, 
      email: `${role}@demo.com` 
    };
    return next();
  }

  try {
    // Verify the Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const db = getDB();
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // First-time login — auto-create user document in Firestore
      const name = decodedToken.name || decodedToken.email.split('@')[0];
      const newUser = {
        uid,
        name,
        email: decodedToken.email,
        role: 'student',
        department: null,
        batch: null,
        avatar: decodedToken.picture || null,
        skill_points: 0,
        streak: 0,
        last_active: null,
        created_at: new Date(),
      };
      await userRef.set(newUser);
      req.user = { id: uid, ...newUser };
    } else {
      req.user = { id: uid, ...userDoc.data() };
    }

    next();
  } catch (err) {
    console.error('Firebase token verification failed:', err.message);
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const roleGuard = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

module.exports = { authMiddleware, roleGuard };
