import { useState, useEffect, useRef } from 'react';
import WebcamProctoring from '../proctoring/WebcamProctoring';
import { assessmentService } from '../../services/assessmentService';
import { useAuth } from '../../context/AuthContext';
import { Shield, Clock, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, X } from 'lucide-react';

const QUIZ_TIME = 10 * 60; // 10 minutes

/* ── Timer ─────────────────────────────────────────────── */
function QuizTimer({ seconds, onExpire }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const isWarning = seconds < 120;
  const isCritical = seconds < 60;

  useEffect(() => { if (seconds === 0) onExpire(); }, [seconds]);

  return (
    <div className={`timer-chip ${isWarning ? 'warning' : ''}`}>
      <Clock size={14} />
      {mins}:{secs}
      {isCritical && <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>— Submit now</span>}
    </div>
  );
}

/* ── Submit Confirmation Modal ──────────────────────────── */
function SubmitModal({ answered, total, onConfirm, onCancel }) {
  const unanswered = total - answered;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon" style={{
            background: unanswered > 0 ? 'rgba(217,119,6,0.1)' : 'rgba(22,163,74,0.1)',
            border: `1px solid ${unanswered > 0 ? 'rgba(217,119,6,0.3)' : 'rgba(22,163,74,0.3)'}`,
          }}>
            {unanswered > 0
              ? <AlertTriangle size={24} color="var(--color-warning)" />
              : <CheckCircle size={24} color="var(--color-success)" />}
          </div>
          <h2 className="modal-title">Submit Assessment?</h2>
        </div>
        <div className="modal-body">
          {unanswered > 0 ? (
            <>
              You've answered <strong style={{ color: 'var(--text-primary)' }}>{answered} of {total}</strong> questions.
              <br />
              <span style={{ color: 'var(--color-warning)' }}>{unanswered} question{unanswered > 1 ? 's' : ''} remain unanswered.</span>
              <br /><br />
              Are you sure you want to submit? Unanswered questions will be marked incorrect.
            </>
          ) : (
            <>
              You've answered all <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> questions.
              <br /><br />
              Are you ready to submit your assessment?
            </>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onCancel}>
            Continue
          </button>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={onConfirm}>
            Submit Assessment
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Proctoring Warning Toast ───────────────────────────── */
function ProctoringToast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="toast-container">
      <div className="toast toast-warning" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={15} color="#d97706" />
        <span>Proctoring Alert: {message}</span>
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}>
          <X size={13} color="#92400e" />
        </button>
      </div>
    </div>
  );
}

/* ── Main ProctoredMCQQuiz ──────────────────────────────── */
export default function ProctoredMCQQuiz({ quiz, onFinish }) {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [warningToast, setWarningToast] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const timerRef = useRef(null);

  // 1. Init Firestore session
  useEffect(() => {
    async function initSession() {
      const candidateId = user?.id || user?.uid || 'student_demo_1';
      const sessionData = await assessmentService.startOrGetSession({
        assessmentId: quiz.id || 'dsa_mcq',
        assessmentTitle: quiz.title,
        candidateId,
        candidateName: user?.name || 'Candidate',
        candidateEmail: user?.email || '',
        maxViolations: 3,
      });
      setSession(sessionData);
      if (sessionData?.answers) setAnswers(sessionData.answers);
      if (sessionData?.status === 'submitted') setSubmitted(true);
    }
    initSession();
  }, [quiz.id, user]);

  // 2. Realtime Firestore subscription
  useEffect(() => {
    if (!session?.id) return;
    const unsubscribe = assessmentService.subscribeSession(session.id, (updated) => {
      setSession(updated);
      if (updated.status === 'cancelled' || updated.status === 'submitted') {
        clearInterval(timerRef.current);
      }
    });
    return () => unsubscribe();
  }, [session?.id]);

  // 3. Timer
  useEffect(() => {
    if (session?.status === 'active' && !submitted) {
      timerRef.current = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [session?.status, submitted]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted && session?.status === 'active') handleSubmit();
  }, [timeLeft, submitted, session?.status]);

  const handleSelect = (questionId, answer) => {
    if (session?.status !== 'active') return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleViolationDetected = async ({ type, severity, message }) => {
    if (!session || session.status !== 'active') return;
    setWarningToast({ type, message });
    const updated = await assessmentService.recordViolation({ sessionId: session.id, type, severity, message });
    if (updated) setSession(updated);
  };

  const handleSubmit = async () => {
    setShowSubmitModal(false);
    clearInterval(timerRef.current);
    let score = 0;
    quiz.questions.forEach(q => { if (answers[q.id] === q.correct_answer) score++; });
    const pct = Math.round((score / quiz.questions.length) * 100);
    setResult({ score, total: quiz.questions.length, percentage: pct });
    setSubmitted(true);
    if (session?.id) {
      await assessmentService.submitSession({ sessionId: session.id, answers, score });
    }
  };

  // ── CANCELLED SCREEN ─────────────────────────────────────
  if (session?.status === 'cancelled') {
    return (
      <div style={{ maxWidth: 580, margin: '60px auto', padding: '0 24px' }}>
        <div className="card animate-fadeInUp" style={{
          textAlign: 'center', padding: '52px 36px',
          borderColor: 'rgba(220,38,38,0.2)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <AlertTriangle size={28} color="var(--color-danger)" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Assessment Terminated
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
            This assessment has been terminated because the permitted proctoring violation limit was exceeded.
          </p>

          <div style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', padding: '16px 20px', textAlign: 'left', marginBottom: 28,
          }}>
            {[
              { label: 'Assessment', value: quiz.title },
              { label: 'Status', value: 'Terminated' },
              { label: 'Violations', value: `${session.violationCount} / ${session.maxViolations || 3}` },
              { label: 'Time', value: session.cancelledAt ? new Date(session.cancelledAt).toLocaleTimeString() : new Date().toLocaleTimeString() },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
            This assessment result has been recorded in the system. Please contact your recruiter or administrator if you believe this was in error.
          </p>

          <button className="btn btn-secondary" onClick={onFinish} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <ChevronLeft size={14} /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── RESULT SCREEN ─────────────────────────────────────────
  if (submitted || session?.status === 'submitted') {
    const finalScore = result?.score ?? session?.score ?? 0;
    const finalTotal = result?.total ?? quiz.questions.length;
    const pct = result?.percentage ?? Math.round((finalScore / finalTotal) * 100);
    const submissionId = `ASSESS-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    return (
      <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 24px' }}>
        <div className="card animate-fadeInUp" style={{ textAlign: 'center', padding: '52px 36px' }}>
          {/* Success icon */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: pct >= 60 ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)',
            border: `1px solid ${pct >= 60 ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.25)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <CheckCircle size={34} color={pct >= 60 ? 'var(--color-success)' : 'var(--color-danger)'} />
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.02em' }}>
            Assessment Submitted
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 28 }}>
            Your responses have been successfully recorded.
          </p>

          {/* Score */}
          <div style={{
            fontSize: '3.5rem', fontWeight: 900, color: pct >= 80 ? 'var(--color-success)' : pct >= 60 ? 'var(--color-warning)' : 'var(--color-danger)',
            letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 8,
          }}>
            {pct}%
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 32 }}>
            {finalScore} correct out of {finalTotal} questions
          </p>

          {/* Submission details */}
          <div style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', padding: '16px 20px', textAlign: 'left', marginBottom: 28,
          }}>
            {[
              { label: 'Submission ID', value: `#${submissionId}` },
              { label: 'Assessment', value: quiz.title },
              { label: 'Submitted', value: `Today, ${new Date().toLocaleTimeString()}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700, fontFamily: label === 'Submission ID' ? 'monospace' : 'inherit' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Answer Review */}
          <div style={{ textAlign: 'left', marginBottom: 28 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 12 }}>Answer Review</h3>
            {quiz.questions.map((q, i) => {
              const isCorrect = answers[q.id] === q.correct_answer;
              return (
                <div key={q.id} style={{
                  padding: '10px 14px', borderRadius: 8, marginBottom: 6,
                  background: isCorrect ? 'rgba(22,163,74,0.05)' : 'rgba(220,38,38,0.05)',
                  border: `1px solid ${isCorrect ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flexShrink: 0, marginTop: 1 }}>
                      {isCorrect
                        ? <CheckCircle size={14} color="var(--color-success)" />
                        : <X size={14} color="var(--color-danger)" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Q{i + 1}. {q.question_text}</p>
                      {!isCorrect && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginBottom: 2 }}>
                          Your answer: {answers[q.id] || 'Not answered'}
                        </p>
                      )}
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>
                        Correct: {q.correct_answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="btn btn-primary" onClick={onFinish} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <ChevronLeft size={14} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── ACTIVE QUIZ ───────────────────────────────────────────
  const q = quiz.questions[currentQ];
  const answered = Object.keys(answers).length;

  return (
    <div className="assessment-shell">
      {/* Proctoring warning toast */}
      {warningToast && (
        <ProctoringToast message={warningToast.message} onDismiss={() => setWarningToast(null)} />
      )}

      {/* Submit confirmation modal */}
      {showSubmitModal && (
        <SubmitModal
          answered={answered}
          total={quiz.questions.length}
          onConfirm={handleSubmit}
          onCancel={() => setShowSubmitModal(false)}
        />
      )}

      {/* Webcam Proctoring Widget */}
      <WebcamProctoring
        isActive={session?.status === 'active'}
        onViolationDetected={handleViolationDetected}
        currentViolations={session?.violationCount || 0}
        maxViolations={session?.maxViolations || 3}
      />

      {/* ── Header ── */}
      <div className="assessment-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 28, height: 28, background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
            borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={14} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>AssessHub</span>
          <span style={{ color: 'var(--border-default)' }}>·</span>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{quiz.title}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <QuizTimer seconds={timeLeft} onExpire={handleSubmit} />
          <button
            className="btn btn-primary btn-sm"
            id="submit-quiz-btn"
            onClick={() => setShowSubmitModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--border-subtle)' }}>
        <div style={{
          height: '100%', background: 'var(--color-primary)',
          width: `${((currentQ + 1) / quiz.questions.length) * 100}%`,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* ── Body ── */}
      <div className="assessment-body">
        {/* Question Panel */}
        <div className="question-card animate-fadeIn">
          <div className="question-number-badge">
            Question {currentQ + 1} of {quiz.questions.length}
          </div>

          <p className="question-text">{q.question_text}</p>

          <div>
            {q.options.map((opt, i) => {
              const isSelected = answers[q.id] === opt;
              return (
                <button
                  key={i}
                  className={`answer-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(q.id, opt)}
                  disabled={session?.status !== 'active'}
                >
                  <span className="answer-option-letter">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
            <button
              className="btn btn-secondary"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ(c => c - 1)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            {currentQ < quiz.questions.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentQ(c => c + 1)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={() => setShowSubmitModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <CheckCircle size={14} /> Submit Assessment
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="question-nav-card">
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 4 }}>Questions</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{answered} of {quiz.questions.length} answered</p>
          </div>

          <div className="q-nav-grid">
            {quiz.questions.map((_, i) => {
              const isAnswered = answers[quiz.questions[i].id] !== undefined;
              const isCurrent = i === currentQ;
              return (
                <button
                  key={i}
                  className={`q-nav-btn ${isCurrent ? 'current' : isAnswered ? 'answered' : ''}`}
                  onClick={() => setCurrentQ(i)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {[
              { cls: 'current',  label: 'Current' },
              { cls: 'answered', label: 'Answered' },
              { cls: '',         label: 'Not answered' },
            ].map(({ cls, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div className={`q-nav-btn ${cls}`} style={{ width: 14, height: 14, aspectRatio: 'auto', padding: 0, minWidth: 14, fontSize: 0 }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Proctoring status */}
          <div style={{
            padding: '10px 12px', borderRadius: 8,
            background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s ease infinite' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Proctoring Active
              </span>
            </div>
            {session?.violationCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <AlertTriangle size={11} color="var(--color-warning)" />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-warning)', fontWeight: 600 }}>
                  {session.violationCount}/{session.maxViolations || 3} warnings
                </span>
              </div>
            )}
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Stay visible on camera and do not leave this window.
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="assessment-footer">
        <div className="proctor-badge" style={{ fontSize: '0.75rem' }}>
          <div className="proctor-dot" />
          Proctoring Active
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Question {currentQ + 1} / {quiz.questions.length}
        </span>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
