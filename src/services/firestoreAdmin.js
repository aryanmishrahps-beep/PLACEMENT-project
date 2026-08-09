const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
require('dotenv').config();

let db = null;
let adminApp = null;

function getAdminDB() {
  if (db) return db;

  try {
    if (getApps().length === 0) {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
        : null;

      if (serviceAccount) {
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'placement-portal'
        });
        db = getFirestore(adminApp);
      } else if (process.env.FIRESTORE_EMULATOR_HOST) {
        adminApp = initializeApp({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'placement-portal'
        });
        db = getFirestore(adminApp);
      }
    }
  } catch (err) {
    console.warn('Firebase Admin Initialization Notice (using atomic session manager):', err.message);
  }

  return db;
}

// Memory fallback store if Firebase Admin credentials are not attached in local dev
const inMemoryStore = {
  sessions: new Map(),
  violations: new Map()
};

/**
 * Session Firestore Service
 */
const sessionService = {
  // Get or Create Session
  async getOrCreateSession({ sessionId, candidateId, candidateName, candidateEmail, assessmentId, assessmentTitle, maxViolations = 3 }) {
    const db = getAdminDB();
    const docId = sessionId || `${candidateId}_${assessmentId}`;

    if (db) {
      try {
        const docRef = db.collection('assessmentSessions').doc(docId);
        const snapshot = await docRef.get();

        if (snapshot.exists) {
          return { id: snapshot.id, ...snapshot.data() };
        }

        const newSession = {
          candidateId,
          candidateName: candidateName || 'Candidate',
          candidateEmail: candidateEmail || '',
          assessmentId: String(assessmentId),
          assessmentTitle: assessmentTitle || 'Proctored Assessment',
          status: 'active', // 'active' | 'submitted' | 'cancelled'
          startedAt: new Date().toISOString(),
          submittedAt: null,
          cancelledAt: null,
          cancellationReason: null,
          violationCount: 0,
          maxViolations: maxViolations || 3,
          score: null,
          answers: {}
        };

        await docRef.set(newSession);
        return { id: docId, ...newSession };
      } catch (e) {
        console.warn('Firestore doc read/write error, operating on local session cache:', e.message);
      }
    }

    // In-memory fallback
    if (!inMemoryStore.sessions.has(docId)) {
      inMemoryStore.sessions.set(docId, {
        id: docId,
        candidateId,
        candidateName: candidateName || 'Candidate',
        candidateEmail: candidateEmail || '',
        assessmentId: String(assessmentId),
        assessmentTitle: assessmentTitle || 'Proctored Assessment',
        status: 'active',
        startedAt: new Date().toISOString(),
        submittedAt: null,
        cancelledAt: null,
        cancellationReason: null,
        violationCount: 0,
        maxViolations: maxViolations || 3,
        score: null,
        answers: {}
      });
      inMemoryStore.violations.set(docId, []);
    }

    return inMemoryStore.sessions.get(docId);
  },

  // Record Violation Atomically
  async recordViolation({ sessionId, type, severity = 'HIGH', message }) {
    const db = getAdminDB();
    const now = new Date().toISOString();
    const violationId = `viol_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    if (db) {
      try {
        const docRef = db.collection('assessmentSessions').doc(sessionId);

        // Perform Firestore Transaction for atomic increment & strict threshold verification
        const updatedSession = await db.runTransaction(async (transaction) => {
          const doc = await transaction.get(docRef);
          if (!doc.exists) {
            throw new Error('Assessment session not found.');
          }

          const data = doc.data();
          
          // If already cancelled or submitted, lock state
          if (data.status !== 'active') {
            return { id: doc.id, ...data, locked: true };
          }

          const newCount = (data.violationCount || 0) + 1;
          const isCancelled = newCount >= (data.maxViolations || 3);

          const updates = {
            violationCount: newCount,
            lastViolationAt: now
          };

          if (isCancelled) {
            updates.status = 'cancelled';
            updates.cancelledAt = now;
            updates.cancellationReason = `Maximum proctoring violations reached (${newCount}/${data.maxViolations || 3}). Reason: ${message || type}`;
          }

          transaction.update(docRef, updates);

          // Add violation document to subcollection
          const violRef = docRef.collection('violations').doc(violationId);
          transaction.set(violRef, {
            id: violationId,
            type: type || 'PROCTORING_VIOLATION',
            timestamp: now,
            severity,
            message: message || 'Proctoring violation detected by computer vision system.',
            violationNumber: newCount
          });

          return { id: doc.id, ...data, ...updates };
        });

        return updatedSession;
      } catch (err) {
        console.warn('Firestore transaction error, using fallback atomic store:', err.message);
      }
    }

    // In-memory fallback atomic execution
    const session = inMemoryStore.sessions.get(sessionId);
    if (!session) return { error: 'Session not found' };

    if (session.status !== 'active') {
      return { ...session, locked: true };
    }

    session.violationCount += 1;
    session.lastViolationAt = now;

    if (session.violationCount >= session.maxViolations) {
      session.status = 'cancelled';
      session.cancelledAt = now;
      session.cancellationReason = `Maximum proctoring violations reached (${session.violationCount}/${session.maxViolations}). Reason: ${message || type}`;
    }

    const list = inMemoryStore.violations.get(sessionId) || [];
    list.push({
      id: violationId,
      type: type || 'PROCTORING_VIOLATION',
      timestamp: now,
      severity,
      message: message || 'Proctoring violation detected.',
      violationNumber: session.violationCount
    });
    inMemoryStore.violations.set(sessionId, list);

    return session;
  },

  // Submit Assessment
  async submitSession({ sessionId, answers, score }) {
    const db = getAdminDB();
    const now = new Date().toISOString();

    if (db) {
      try {
        const docRef = db.collection('assessmentSessions').doc(sessionId);
        const snapshot = await docRef.get();

        if (snapshot.exists) {
          const current = snapshot.data();
          if (current.status === 'cancelled') {
            return { ...current, error: 'Cannot submit a cancelled assessment.' };
          }

          const updates = {
            status: 'submitted',
            submittedAt: now,
            answers: answers || current.answers || {},
            score: score !== undefined ? score : current.score
          };

          await docRef.update(updates);
          return { id: sessionId, ...current, ...updates };
        }
      } catch (e) {
        console.warn('Firestore submit error:', e.message);
      }
    }

    const session = inMemoryStore.sessions.get(sessionId);
    if (session) {
      if (session.status === 'cancelled') {
        return { ...session, error: 'Cannot submit a cancelled assessment.' };
      }
      session.status = 'submitted';
      session.submittedAt = now;
      session.answers = answers || {};
      session.score = score !== undefined ? score : session.score;
      return session;
    }

    return null;
  },

  // Fetch Session
  async getSession(sessionId) {
    const db = getAdminDB();
    if (db) {
      try {
        const docRef = db.collection('assessmentSessions').doc(sessionId);
        const snapshot = await docRef.get();
        if (snapshot.exists) {
          const violationsSnap = await docRef.collection('violations').orderBy('timestamp', 'desc').get();
          const violations = violationsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          return { id: snapshot.id, ...snapshot.data(), violations };
        }
      } catch (e) {
        console.warn('Firestore fetch error:', e.message);
      }
    }

    const session = inMemoryStore.sessions.get(sessionId);
    if (session) {
      const violations = inMemoryStore.violations.get(sessionId) || [];
      return { ...session, violations };
    }
    return null;
  }
};

module.exports = { sessionService, getAdminDB };
