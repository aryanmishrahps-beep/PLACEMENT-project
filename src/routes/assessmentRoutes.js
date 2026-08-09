const express = require('express');
const router = express.Router();
const {
  startOrGetSession,
  recordViolation,
  submitAssessment,
  getSession
} = require('../controllers/assessmentController');

// Optional auth middleware integration helper
let authMiddleware = (req, res, next) => next();
try {
  const authModule = require('../../server/middleware/auth');
  if (authModule && authModule.authMiddleware) {
    authMiddleware = authModule.authMiddleware;
  }
} catch (e) {
  // Use fallback if server/middleware/auth is not active
}

// Session routes
router.post('/sessions/start', startOrGetSession);
router.post('/sessions/:sessionId/violation', recordViolation);
router.post('/sessions/:sessionId/submit', submitAssessment);
router.get('/sessions/:sessionId', getSession);

module.exports = router;
