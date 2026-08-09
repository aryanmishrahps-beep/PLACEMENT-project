const { sessionService } = require('../services/firestoreAdmin');

/**
 * Controller: Start or Retrieve Session
 */
const startOrGetSession = async (req, res) => {
  try {
    const { assessmentId, assessmentTitle, candidateName, candidateEmail, maxViolations } = req.body;
    // Derive candidate identity securely from req.user if present, or fallback body
    const candidateId = (req.user && (req.user.id || req.user.uid)) || req.body.candidateId || 'student_demo_1';
    
    const sessionId = `${candidateId}_${assessmentId || 'dsa_mcq'}`;

    const session = await sessionService.getOrCreateSession({
      sessionId,
      candidateId,
      candidateName: candidateName || (req.user && req.user.name) || 'Candidate',
      candidateEmail: candidateEmail || (req.user && req.user.email) || '',
      assessmentId: assessmentId || 'dsa_mcq',
      assessmentTitle: assessmentTitle || 'Proctored Assessment',
      maxViolations: maxViolations || 3
    });

    return res.status(200).json({
      success: true,
      message: 'Assessment session retrieved/initialized successfully',
      data: session
    });
  } catch (error) {
    console.error('Error starting assessment session:', error);
    return res.status(500).json({ success: false, message: 'Failed to initialize assessment session', error: error.message });
  }
};

/**
 * Controller: Record Proctoring Violation (Atomic)
 */
const recordViolation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { type, severity, message } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required.' });
    }

    const updatedSession = await sessionService.recordViolation({
      sessionId,
      type: type || 'PROCTORING_VIOLATION',
      severity: severity || 'HIGH',
      message: message || 'Proctoring violation detected.'
    });

    if (!updatedSession) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    return res.status(200).json({
      success: true,
      message: updatedSession.status === 'cancelled' 
        ? 'Proctoring threshold reached. Assessment has been CANCELLED.'
        : 'Violation recorded successfully.',
      data: updatedSession
    });
  } catch (error) {
    console.error('Error recording proctoring violation:', error);
    return res.status(500).json({ success: false, message: 'Failed to record violation', error: error.message });
  }
};

/**
 * Controller: Submit Assessment
 */
const submitAssessment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answers, score } = req.body;

    const result = await sessionService.submitSession({
      sessionId,
      answers,
      score
    });

    if (result && result.error) {
      return res.status(400).json({ success: false, message: result.error, data: result });
    }

    return res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully.',
      data: result
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit assessment', error: error.message });
  }
};

/**
 * Controller: Get Session Status & Violations
 */
const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await sessionService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    return res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch session', error: error.message });
  }
};

module.exports = {
  startOrGetSession,
  recordViolation,
  submitAssessment,
  getSession
};
