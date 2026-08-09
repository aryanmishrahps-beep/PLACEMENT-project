import { useState, useEffect, useRef } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { SAMPLE_MCQ } from '../../data/seedData';
import ProctoredMCQQuiz from '../../components/assessment/ProctoredMCQQuiz';

const QUIZ_TIME = 10 * 60; // 10 minutes in seconds

function QuizTimer({ seconds, onExpire }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const isWarning = seconds < 120;
  useEffect(() => { if (seconds === 0) onExpire(); }, [seconds]);
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

function MCQQuiz({ quiz, onFinish }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      handleSubmit();
    }
  }, [timeLeft, submitted]);

  const handleSelect = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) score++;
    });
    const pct = Math.round((score / quiz.questions.length) * 100);
    setResult({ score, total: quiz.questions.length, percentage: pct });
    setSubmitted(true);
  };

  if (submitted && result) {
    return (
      <div className="card animate-fadeInUp" style={{ textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
          {result.percentage >= 80 ? '🏆' : result.percentage >= 60 ? '👍' : '💪'}
        </div>
        <h2 className="text-2xl font-bold" style={{ marginBottom: '8px' }}>
          {result.percentage >= 80 ? 'Excellent!' : result.percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
        </h2>
        <div style={{ fontSize: '3.5rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '16px 0' }}>
          {result.percentage}%
        </div>
        <p className="text-secondary" style={{ marginBottom: '24px' }}>
          You scored <strong style={{ color: 'var(--text-primary)' }}>{result.score} / {result.total}</strong> questions correctly
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
                {q.explanation && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', padding: '8px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-md" style={{ justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onFinish}>← Back to Assessments</button>
          <button className="btn btn-primary" onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQ(0); setTimeLeft(QUIZ_TIME); }}>
            🔄 Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const q = quiz.questions[currentQ];
  const answered = Object.keys(answers).length;

  return (
    <div className="animate-fadeIn">
      {/* Quiz Header */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 24px' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">{quiz.title}</h2>
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
        {/* Question */}
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
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-glass-hover)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-glass)'; }}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
            {[
              { color: 'var(--color-primary)', label: 'Current' },
              { color: 'var(--color-accent)', label: 'Answered' },
              { color: 'var(--border-default)', label: 'Not Answered' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-sm">
                <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                <span className="text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [activeQuiz, setActiveQuiz] = useState(null);

  const quizTypes = [
    { id: 'all', label: 'All Tests', icon: '📋' },
    { id: 'mcq', label: 'MCQ Tests', icon: '📝' },
    { id: 'coding', label: 'Coding', icon: '💻' },
    { id: 'mock', label: 'Mock Tests', icon: '🎯' },
  ];

  const assessments = [
    { id: 1, title: 'DSA Fundamentals MCQ', type: 'mcq', questions: 20, time: 30, difficulty: 'medium', topics: ['Arrays', 'Sorting', 'Searching'] },
    { id: 2, title: 'DBMS Comprehensive Test', type: 'mcq', questions: 25, time: 40, difficulty: 'hard', topics: ['SQL', 'Normalization'] },
    { id: 3, title: 'Aptitude Reasoning Test', type: 'mcq', questions: 30, time: 45, difficulty: 'medium', topics: ['Quant', 'Logical'] },
    { id: 4, title: 'Full Mock Placement Test', type: 'mock', questions: 60, time: 90, difficulty: 'hard', topics: ['All Topics'] },
    { id: 5, title: 'Two Sum Problem', type: 'coding', questions: 1, time: 20, difficulty: 'easy', topics: ['Arrays', 'HashMap'] },
    { id: 6, title: 'Binary Search Challenge', type: 'coding', questions: 1, time: 15, difficulty: 'medium', topics: ['DSA', 'Binary Search'] },
  ];

  const filtered = activeTab === 'all' ? assessments : assessments.filter(a => a.type === activeTab);

  if (activeQuiz) {
    return (
      <ProtectedLayout title="AI Proctored MCQ Quiz" allowedRoles={['student']}>
        <ProctoredMCQQuiz
          quiz={{ id: activeQuiz.id, title: activeQuiz.title, questions: SAMPLE_MCQ }}
          onFinish={() => setActiveQuiz(null)}
        />
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout title="Assessments" allowedRoles={['student']}>
      <div className="page-header">
        <h1 className="page-title">Assessments 📝</h1>
        <p className="page-subtitle">Topic-wise MCQs, coding challenges, and full mock placement tests.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-sm animate-fadeInUp" style={{ marginBottom: '24px' }}>
        {quizTypes.map((t) => (
          <button key={t.id}
            className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-4 animate-fadeInUp" style={{ marginBottom: '24px' }}>
        {[
          { icon: '✅', value: '23', label: 'Tests Completed', color: 'var(--color-accent)' },
          { icon: '📊', value: '78%', label: 'Average Score', color: 'var(--color-primary)' },
          { icon: '🔥', value: '5', label: 'Day Streak', color: 'var(--color-warning)' },
          { icon: '🏆', value: '#12', label: 'Leaderboard Rank', color: '#a855f7' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: '1.75rem' }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Assessment List */}
      <div className="animate-fadeInUp animate-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((a) => (
          <div key={a.id} className="quiz-card">
            <div className="quiz-icon" style={{
              background: a.type === 'mock' ? 'rgba(245,158,11,0.15)' : a.type === 'coding' ? 'var(--color-accent-glow)' : 'var(--color-primary-glow)',
            }}>
              {a.type === 'mock' ? '🎯' : a.type === 'coding' ? '💻' : '📝'}
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-sm" style={{ marginBottom: '4px' }}>
                <span className="font-bold">{a.title}</span>
                <span className={`badge badge-${a.difficulty === 'hard' ? 'danger' : a.difficulty === 'medium' ? 'warning' : 'accent'}`}>
                  {a.difficulty}
                </span>
              </div>
              <div className="flex gap-md text-xs text-muted">
                <span>📋 {a.questions} questions</span>
                <span>⏱ {a.time} min</span>
                <span>🏷 {a.topics.join(', ')}</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => a.type === 'mcq' ? setActiveQuiz(a) : a.type === 'coding' ? window.location.href = '/student/code' : setActiveQuiz(a)}
            >
              {a.type === 'coding' ? 'Open Editor →' : 'Start Test →'}
            </button>
          </div>
        ))}
      </div>
    </ProtectedLayout>
  );
}
