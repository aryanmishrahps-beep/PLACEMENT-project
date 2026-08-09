import { useState, useEffect, useRef } from 'react';
import WebcamProctoring from '../proctoring/WebcamProctoring';
import { assessmentService } from '../../services/assessmentService';
import { useAuth } from '../../context/AuthContext';

const QUIZ_TIME = 10 * 60; // 10 minutes

function QuizTimer({ seconds, onExpire }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const isWarning = seconds < 120;

  useEffect(() => {
    if (seconds === 0) onExpire();
  }, [seconds]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      background: isWarning ? 'rgba(239,68,68,0.15)' : 'var(--bg-glass)',
      border: `1px solid ${isWarning ? 'rgba(239,68,68,0.4)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-full)',
      padding: '8px 16px',
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 700,
      fontSize: '1.1rem',
      color: isWarning ? 'var(--color-danger)' : 'var(--text-primary)',
      animation: isWarning ? 'pulse-glow 1s infinite' : 'none',
    }}>
      ⏱ {mins}:{secs}
    </div>
  );
}

export default function ProctoredMCQQuiz({ quiz, onFinish }) {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [warningToast, setWarningToast] = useState(null);

  const timerRef = useRef(null);

  // 1. Initialize or load Firestore session on mount
  useEffect(() => {
    async function initSession() {
      const candidateId = user?.id || user?.uid || 'student_demo_1';
      const candidateName = user?.name || 'Candidate';
      const candidateEmail = user?.email || '';

      const sessionData = await assessmentService.startOrGetSession({
        assessmentId: quiz.id || 'dsa_mcq',
        assessmentTitle: quiz.title,
        candidateId,
        candidateName,
        candidateEmail,
        maxViolations: 3
      });

      setSession(sessionData);

      if (sessionData) {
        if (sessionData.answers) setAnswers(sessionData.answers);
        if (sessionData.status === 'submitted') {
          setSubmitted(true);
        }
      }
    }

    initSession();
  }, [quiz.id, user]);

  // 2. Real-time Firestore Subscription for Instant Anti-Cheating Locking
  useEffect(() => {
    if (!session?.id) return;

    const unsubscribe = assessmentService.subscribeSession(session.id, (updatedSession) => {
      setSession(updatedSession);
      if (updatedSession.status === 'cancelled' || updatedSession.status === 'submitted') {
        clearInterval(timerRef.current);
      }
    });

    return () => unsubscribe();
  }, [session?.id]);

  // 3. Quiz Countdown Timer
  useEffect(() => {
    if (session?.status === 'active' && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [session?.status, submitted]);

  // Auto-submit on timer zero
  useEffect(() => {
    if (timeLeft === 0 && !submitted && session?.status === 'active') {
      handleSubmit();
    }
  }, [timeLeft, submitted, session?.status]);

  // Handle Option Select
  const handleSelect = (questionId, answer) => {
    if (session?.status !== 'active') return;
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // Handle Proctoring Violation Triggered by Webcam/Computer Vision
  const handleViolationDetected = async ({ type, severity, message }) => {
    if (!session || session.status !== 'active') return;

    // Show warning toast overlay
    setWarningToast({ type, message });
    setTimeout(() => setWarningToast(null), 4500);

    // Call atomic backend API / Firestore update
    const updated = await assessmentService.recordViolation({
      sessionId: session.id,
      type,
      severity,
      message
    });

    if (updated) {
      setSession(updated);
    }
  };

  // Handle Quiz Submission
  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) score++;
    });
    const pct = Math.round((score / quiz.questions.length) * 100);
    const resObj = { score, total: quiz.questions.length, percentage: pct };
    
    setResult(resObj);
    setSubmitted(true);

    if (session?.id) {
      await assessmentService.submitSession({
        sessionId: session.id,
        answers,
        score
      });
    }
  };

  // ─── CANCELLED ASSESSMENT SCREEN ─────────────────────────────────────────────
  if (session?.status === 'cancelled') {
    return (
      <div className="card animate-fadeInUp" style={{
        textAlign: 'center',
        padding: '56px 32px',
        border: '2px solid rgba(239, 68, 68, 0.4)',
        background: 'rgba(239, 68, 68, 0.04)',
        maxWidth: '720px',
        margin: '32px auto'
      }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '16px' }}>🚨</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-danger, #ef4444)', marginBottom: '12px' }}>
          ASSESSMENT CANCELLED
        </h1>
        <div className="badge badge-danger" style={{ fontSize: '0.9rem', padding: '6px 16px', marginBottom: '24px' }}>
          Proctoring Violation Limit Exceeded ({session.violationCount}/{session.maxViolations || 3})
        </div>

        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          textAlign: 'left',
          marginBottom: '28px',
          fontSize: '0.9rem'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Reason for Termination:
          </div>
          <div style={{ color: 'var(--color-danger, #ef4444)', fontFamily: 'monospace', marginBottom: '12px' }}>
            {session.cancellationReason || 'Multiple unverified proctoring violations detected.'}
          </div>
          <div className="text-xs text-muted">
            Cancelled At: {session.cancelledAt ? new Date(session.cancelledAt).toLocaleString() : new Date().toLocaleString()}
          </div>
        </div>

        <p className="text-secondary" style={{ marginBottom: '28px', lineHeight: 1.6 }}>
          This assessment has been locked and permanently recorded in Cloud Firestore. Re-entry or refreshing the page is disabled per institution proctoring rules.
        </p>

        <button className="btn btn-secondary" onClick={onFinish}>
          ← Return to Assessments
        </button>
      </div>
    );
  }

  // ─── SUBMITTED / RESULTS SCREEN ──────────────────────────────────────────────
  if (submitted || session?.status === 'submitted') {
    const finalScore = result?.score ?? session?.score ?? 0;
    const finalTotal = result?.total ?? quiz.questions.length;
    const pct = result?.percentage ?? Math.round((finalScore / finalTotal) * 100);

    return (
      <div className="card animate-fadeInUp" style={{ textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
          {pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '💪'}
        </div>
        <h2 className="text-2xl font-bold" style={{ marginBottom: '8px' }}>
          {pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good Job!' : 'Keep Practicing!'}
        </h2>
        <div style={{ fontSize: '3.5rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '16px 0' }}>
          {pct}%
        </div>
        <p className="text-secondary" style={{ marginBottom: '24px' }}>
          You scored <strong style={{ color: 'var(--text-primary)' }}>{finalScore} / {finalTotal}</strong> questions correctly
        </p>

        {/* Answer Review */}
        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <h3 className="font-bold text-lg" style={{ marginBottom: '16px' }}>Answer Review</h3>
          {quiz.questions.map((q, i) => {
            const isCorrect = answers[q.id] === q.correct_answer;
            return (
              <div key={q.id} className="card" style={{ marginBottom: '12px', borderColor: isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)', background: isCorrect ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)' }}>
                <div className="flex items-center gap-sm" style={{ marginBottom: '8px' }}>
                  <span>{isCorrect ? '✅' : '❌'}</span>
                  <span className="font-semibold text-sm">Q{i + 1}. {q.question_text}</span>
                </div>
                {!isCorrect && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-danger)', marginBottom: '4px' }}>
                    Your answer: <em>{answers[q.id] || 'Not answered'}</em>
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>
                  ✓ Correct: <strong>{q.correct_answer}</strong>
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn btn-secondary" onClick={onFinish}>← Back to Assessments</button>
      </div>
    );
  }

  // ─── ACTIVE TEST QUESTION INTERFACE ──────────────────────────────────────────
  const q = quiz.questions[currentQ];
  const answered = Object.keys(answers).length;

  return (
    <div className="animate-fadeIn" style={{ position: 'relative' }}>
      {/* Real-time Webcam Proctoring Component */}
      <WebcamProctoring
        isActive={session?.status === 'active'}
        onViolationDetected={handleViolationDetected}
        currentViolations={session?.violationCount || 0}
        maxViolations={session?.maxViolations || 3}
      />

      {/* Warning Toast Notification Overlay */}
      {warningToast && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          background: 'rgba(239, 68, 68, 0.95)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '30px',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'bounce 0.4s ease'
        }}>
          <span>⚠️ PROCTORING WARNING:</span>
          <span>{warningToast.message}</span>
        </div>
      )}

      {/* Quiz Header */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 24px' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-sm">
              <h2 className="font-bold text-lg">{quiz.title}</h2>
              <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>📷 AI Proctored</span>
            </div>
            <div className="text-xs text-muted">{answered} of {quiz.questions.length} answered</div>
          </div>
          <QuizTimer seconds={timeLeft} onExpire={handleSubmit} />
          <button className="btn btn-primary" onClick={handleSubmit}>Submit Quiz</button>
        </div>
        {/* Progress */}
        <div className="progress-bar-container" style={{ marginTop: '12px', height: '4px' }}>
          <div className="progress-bar-fill" style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '20px', alignItems: 'start' }}>
        {/* Question Panel */}
        <div className="card">
          <div className="flex items-center gap-sm" style={{ marginBottom: '20px' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-full)',
              background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
            }}>
              {currentQ + 1}
            </div>
            <div className="text-xs text-muted">Question {currentQ + 1} of {quiz.questions.length}</div>
          </div>

          <p className="font-semibold" style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
            {q.question_text}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {q.options.map((opt, i) => {
              const isSelected = answers[q.id] === opt;
              return (
                <button key={i} onClick={() => handleSelect(q.id, opt)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '14px 18px',
                    borderRadius: 'var(--radius-md)', border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-default)'}`,
                    background: isSelected ? 'var(--color-primary-glow)' : 'var(--bg-glass)',
                    color: isSelected ? 'var(--color-primary-light)' : 'var(--text-primary)',
                    cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: 'var(--radius-full)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem',
                    background: isSelected ? 'var(--color-primary)' : 'var(--bg-elevated)', color: 'white', flexShrink: 0,
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Nav Buttons */}
          <div className="flex justify-between" style={{ marginTop: '24px' }}>
            <button className="btn btn-secondary" disabled={currentQ === 0} onClick={() => setCurrentQ(c => c - 1)}>← Prev</button>
            {currentQ < quiz.questions.length - 1
              ? <button className="btn btn-primary" onClick={() => setCurrentQ(c => c + 1)}>Next →</button>
              : <button className="btn btn-accent" onClick={handleSubmit}>Submit Quiz ✅</button>
            }
          </div>
        </div>

        {/* Question Navigator */}
        <div className="card" style={{ position: 'sticky', top: '80px' }}>
          <h3 className="font-bold" style={{ marginBottom: '16px' }}>Question Navigator</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {quiz.questions.map((_, i) => {
              const isAnswered = answers[quiz.questions[i].id] !== undefined;
              const isCurrent = i === currentQ;
              return (
                <button key={i} onClick={() => setCurrentQ(i)} style={{
                  aspectRatio: '1', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.875rem',
                  border: `2px solid ${isCurrent ? 'var(--color-primary)' : isAnswered ? 'var(--color-accent)' : 'var(--border-default)'}`,
                  background: isCurrent ? 'var(--color-primary-glow)' : isAnswered ? 'var(--color-accent-glow)' : 'var(--bg-glass)',
                  color: isCurrent ? 'var(--color-primary-light)' : isAnswered ? 'var(--color-accent-light)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Security Status Box */}
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            fontSize: '0.75rem',
            lineHeight: 1.5,
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
              🔒 Proctored Environment Active
            </div>
            Do not switch tabs, minimize window, or leave the webcam frame. Any violation will be logged atomically to Firestore.
          </div>
        </div>
      </div>
    </div>
  );
}
