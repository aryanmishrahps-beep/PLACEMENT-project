import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import API from './api';

export const assessmentService = {
  // Start or fetch active session from backend & Firestore
  async startOrGetSession({ assessmentId, assessmentTitle, candidateId, candidateName, candidateEmail, maxViolations = 3 }) {
    try {
      const response = await API.post('/assessments/sessions/start', {
        assessmentId,
        assessmentTitle,
        candidateId,
        candidateName,
        candidateEmail,
        maxViolations
      });
      return response.data?.data;
    } catch (err) {
      console.warn('Backend API session fetch error, attempting direct Firestore fetch:', err.message);
      
      const sessionId = `${candidateId || 'student'}_${assessmentId || 'dsa_mcq'}`;
      if (db) {
        try {
          const docRef = doc(db, 'assessmentSessions', sessionId);
          // 1.5 second timeout race to prevent hanging
          const fetchPromise = getDoc(docRef);
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1500));
          const snap = await Promise.race([fetchPromise, timeoutPromise]);
          
          if (snap.exists()) {
            return { id: snap.id, ...snap.data() };
          } else {
            const initialData = {
              candidateId: candidateId || 'student',
              candidateName: candidateName || 'Student',
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
            };
            await setDoc(docRef, initialData).catch(() => {});
            return { id: sessionId, ...initialData };
          }
        } catch (fsErr) {
          console.warn('Direct Firestore initialization notice (using local fallback):', fsErr.message);
        }
      }
      // Local fallback
      return {
        id: sessionId,
        candidateId: candidateId || 'student',
        candidateName: candidateName || 'Student',
        assessmentId: String(assessmentId),
        assessmentTitle: assessmentTitle || 'Proctored Assessment',
        status: 'active',
        startedAt: new Date().toISOString(),
        violationCount: 0,
        maxViolations: maxViolations || 3,
        answers: {}
      };
    }
  },

  // Record Proctoring Violation (invokes trusted backend API for atomic increments & security check)
  async recordViolation({ sessionId, type, severity = 'HIGH', message }) {
    try {
      const response = await API.post(`/assessments/sessions/${sessionId}/violation`, {
        type,
        severity,
        message
      });
      return response.data?.data;
    } catch (err) {
      console.warn('Backend violation record error, attempting direct Firestore update:', err.message);
      if (db) {
        try {
          const docRef = doc(db, 'assessmentSessions', sessionId);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.status !== 'active') return { ...data, locked: true };

            const newCount = (data.violationCount || 0) + 1;
            const isCancelled = newCount >= (data.maxViolations || 3);
            const now = new Date().toISOString();

            const updates = {
              violationCount: newCount,
              lastViolationAt: now
            };

            if (isCancelled) {
              updates.status = 'cancelled';
              updates.cancelledAt = now;
              updates.cancellationReason = `Maximum proctoring violations reached (${newCount}/${data.maxViolations || 3}). Reason: ${message || type}`;
            }

            await updateDoc(docRef, updates);

            // Log subcollection
            try {
              const violCol = collection(db, 'assessmentSessions', sessionId, 'violations');
              await addDoc(violCol, {
                type: type || 'PROCTORING_VIOLATION',
                timestamp: now,
                severity,
                message: message || 'Proctoring violation recorded.',
                violationNumber: newCount
              });
              
              if (isCancelled) {
                 await addDoc(violCol, {
                    type: 'EXAM_CANCELLED',
                    timestamp: now,
                    severity: 'CRITICAL',
                    message: 'Exam terminated due to max violations.',
                    violationNumber: newCount
                 });
              }
            } catch (e) { /* ignore subcollection permission fallback */ }

            return { ...data, ...updates };
          }
        } catch (fsErr) {
          console.warn('Direct Firestore update fallback:', fsErr.message);
        }
      }
      return null;
    }
  },

  // Submit Assessment Session
  async submitSession({ sessionId, answers, score }) {
    try {
      const response = await API.post(`/assessments/sessions/${sessionId}/submit`, {
        answers,
        score
      });
      return response.data?.data;
    } catch (err) {
      console.warn('Backend submission error:', err.message);
      if (db) {
        try {
          const docRef = doc(db, 'assessmentSessions', sessionId);
          const now = new Date().toISOString();
          await updateDoc(docRef, {
            status: 'submitted',
            submittedAt: now,
            answers: answers || {},
            score: score !== undefined ? score : 0
          });
        } catch (e) {}
      }
      return { status: 'submitted', score };
    }
  },

  // Subscribe to real-time session changes from Firestore
  subscribeSession(sessionId, callback) {
    if (!db || !sessionId) return () => {};
    try {
      const docRef = doc(db, 'assessmentSessions', sessionId);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() });
        }
      }, (err) => {
        console.warn('Firestore real-time subscription notice:', err.message);
      });
    } catch (e) {
      return () => {};
    }
  },

  // Log Finalized Discrete Proctoring Event to Firestore
  async logProctoringEvent({ sessionId, event }) {
    if (!sessionId || !event) return;
    const now = event.timestamp || new Date().toISOString();
    const eventPayload = {
      sessionId,
      eventType: event.eventType || 'HEAD_MOVEMENT',
      eventDescription: event.reason || event.eventDescription || `Head movement event: ${event.eventType}`,
      eventTimestamp: now,
      timestamp: now,
      severity: event.severity || 'MEDIUM',
      estimatedDeviation: event.estimatedDeviationCm !== undefined && event.estimatedDeviationCm !== null 
        ? `${event.estimatedDeviationCm} cm` 
        : event.estimatedDeviationNorm !== undefined 
          ? `${event.estimatedDeviationNorm} norm` 
          : event.peakDeviation || 'N/A',
      estimatedDeviationCm: event.estimatedDeviationCm ?? null,
      confidence: event.confidence || 0.90,
      direction: event.direction || 'NONE',
      headPose: event.headPose || null,
      faceCount: event.faceCount ?? 1,
      duration: event.duration || 0,
    };

    // 1. In-memory / localStorage cache for fallback admin report viewing
    try {
      const localKey = `proctor_events_${sessionId}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      existing.push({ id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, ...eventPayload });
      localStorage.setItem(localKey, JSON.stringify(existing.slice(-100)));
    } catch (_) {}

    // 2. Firestore persistence
    try {
      if (db) {
        const eventsCol = collection(db, 'assessmentSessions', sessionId, 'proctoringEvents');
        await addDoc(eventsCol, eventPayload);
      }
    } catch (err) {
      console.warn('Firestore proctoring event log notice:', err?.message);
    }
  },

  // Fetch Proctoring Events for Admin Report
  async getProctoringEvents(sessionId) {
    if (!sessionId) return [];
    let events = [];

    if (db) {
      try {
        const eventsCol = collection(db, 'assessmentSessions', sessionId, 'proctoringEvents');
        const q = query(eventsCol, orderBy('timestamp', 'asc'));
        const snap = await getDocs(q);
        events = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn('Firestore getProctoringEvents error, using local fallback:', err?.message);
      }
    }

    if (events.length === 0) {
      try {
        const localKey = `proctor_events_${sessionId}`;
        events = JSON.parse(localStorage.getItem(localKey) || '[]');
      } catch (_) {}
    }

    return events;
  }
};


