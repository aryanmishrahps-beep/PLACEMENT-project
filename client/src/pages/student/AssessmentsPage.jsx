import { useState, useEffect } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { SAMPLE_MCQ } from '../../data/seedData';
import ProctoredMCQQuiz from '../../components/assessment/ProctoredMCQQuiz';
import {
  ClipboardList, Code2, Target, CheckCircle2, Clock, Users, BarChart3,
  Flame, Trophy, Shield, Wifi, Camera, Monitor, ChevronRight, AlertTriangle, X
} from 'lucide-react';

/* ── Assessment Start Screen ─────────────────────────────── */
function AssessmentStartScreen({ assessment, onStart, onCancel }) {
  const [checks, setChecks] = useState({
    camera: null, browser: true, internet: null,
  });
  const [checksDone, setChecksDone] = useState(false);

  useEffect(() => {
    // Run system checks
    const runChecks = async () => {
      // Browser check (always passes)
      // Internet check
      const online = navigator.onLine;
      // Camera check
      let camOk = false;
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        s.getTracks().forEach(t => t.stop());
        camOk = true;
      } catch {
        camOk = false;
      }
      setChecks({ camera: camOk, browser: true, internet: online });
      setChecksDone(true);
    };
    runChecks();
  }, []);

  const systemItems = [
    { key: 'camera',   icon: Camera,  label: 'Camera detected',          ok: checks.camera },
    { key: 'browser',  icon: Monitor, label: 'Browser supported',         ok: checks.browser },
    { key: 'internet', icon: Wifi,    label: 'Internet connection stable', ok: checks.internet },
  ];

  const allPassed = checksDone && checks.browser && checks.internet;

  const instructions = [
    'Ensure you have a stable internet connection before starting.',
    'Keep your face fully visible in the camera throughout the assessment.',
    'Do not switch browser tabs or minimize the window.',
    'Do not allow another person to appear on camera.',
    'Once submitted, the assessment cannot be restarted.',
    `You have ${assessment?.time || 10} minutes to complete all questions.`,
  ];

  return (
    <div className="start-screen animate-fadeInUp">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <button className="btn btn-secondary btn-sm" onClick={onCancel}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <X size={13} /> Cancel
        </button>
      </div>

      {/* Assessment Info Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-primary" style={{ textTransform: 'none', fontSize: '0.75rem' }}>
                {assessment?.type === 'coding' ? 'Coding Challenge' : assessment?.type === 'mock' ? 'Mock Test' : 'MCQ Assessment'}
              </span>
              {assessment?.type !== 'coding' && (
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Shield size={10} /> Proctored
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.02em' }}>
              {assessment?.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {assessment?.topics?.join(' · ')}
            </p>
          </div>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 24 }}>
          {[
            { icon: ClipboardList, label: 'Questions', value: `${assessment?.questions || 10}` },
            { icon: Clock,         label: 'Duration',  value: `${assessment?.time || 10} min` },
            { icon: BarChart3,     label: 'Difficulty', value: assessment?.difficulty || 'Medium' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '16px 12px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                textAlign: 'center',
              }}>
                <Icon size={18} color="var(--color-primary)" />
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.value}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 16 }}>Important Instructions</h2>
        {instructions.map((inst, i) => (
          <div key={i} className="instruction-item">
            <span className="instruction-num">{String(i + 1).padStart(2, '0')}</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{inst}</span>
          </div>
        ))}
      </div>

      {/* System Check */}
      <div className="card" style={{ marginBottom: 28 }}>
        <h2 className="card-title" style={{ marginBottom: 16 }}>System Check</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {systemItems.map(({ key, icon: Icon, label, ok }) => (
            <div key={key} className={`system-check-item ${ok === true ? 'pass' : ''}`}>
              {!checksDone || ok === null ? (
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: '2px solid var(--border-default)', flexShrink: 0,
                  animation: 'spin 0.8s linear infinite',
                }} />
              ) : ok ? (
                <CheckCircle2 size={18} color="var(--color-success)" />
              ) : (
                <AlertTriangle size={18} color="var(--color-warning)" />
              )}
              <Icon size={14} />
              <span style={{ flex: 1 }}>{label}</span>
              <span style={{
                fontSize: '0.72rem', fontWeight: 700,
                color: !checksDone || ok === null ? 'var(--text-muted)' : ok ? 'var(--color-success)' : 'var(--color-warning)',
              }}>
                {!checksDone || ok === null ? 'Checking…' : ok ? 'Ready' : 'Warning'}
              </span>
            </div>
          ))}
        </div>
        {checksDone && !checks.camera && (
          <p style={{
            marginTop: 12, fontSize: '0.8rem', color: 'var(--color-warning)',
            background: 'var(--color-warning-glow)', padding: '8px 12px',
            borderRadius: 8, border: '1px solid rgba(217,119,6,0.2)',
          }}>
            Camera access is required for proctored assessments. Please allow camera permission and refresh.
          </p>
        )}
      </div>

      {/* Start Button */}
      <button
        id="start-assessment-btn"
        className="btn btn-primary btn-xl w-full"
        onClick={onStart}
        disabled={!checksDone}
        style={{ justifyContent: 'center', fontSize: '1rem' }}
      >
        {!checksDone ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Running system checks…
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} /> Start Assessment <ChevronRight size={16} />
          </span>
        )}
      </button>
      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 12 }}>
        By starting, you agree to the proctoring and assessment integrity policy.
      </p>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── Main Assessments Page ───────────────────────────────── */
export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [startingQuiz, setStartingQuiz] = useState(null); // shows start screen

  const quizTypes = [
    { id: 'all',    label: 'All',    icon: ClipboardList },
    { id: 'mcq',    label: 'MCQ',    icon: ClipboardList },
    { id: 'coding', label: 'Coding', icon: Code2 },
    { id: 'mock',   label: 'Mock',   icon: Target },
  ];

  const assessments = [
    { id: 1, title: 'DSA Fundamentals MCQ',      type: 'mcq',    questions: 20, time: 30, difficulty: 'Medium', topics: ['Arrays', 'Sorting', 'Searching'], proctored: true },
    { id: 2, title: 'DBMS Comprehensive Test',   type: 'mcq',    questions: 25, time: 40, difficulty: 'Hard',   topics: ['SQL', 'Normalization'], proctored: true },
    { id: 3, title: 'Aptitude Reasoning Test',   type: 'mcq',    questions: 30, time: 45, difficulty: 'Medium', topics: ['Quant', 'Logical'], proctored: true },
    { id: 4, title: 'Full Mock Placement Test',  type: 'mock',   questions: 60, time: 90, difficulty: 'Hard',   topics: ['All Topics'], proctored: true },
    { id: 5, title: 'Two Sum Problem',            type: 'coding', questions: 1,  time: 20, difficulty: 'Easy',   topics: ['Arrays', 'HashMap'], proctored: false },
    { id: 6, title: 'Binary Search Challenge',   type: 'coding', questions: 1,  time: 15, difficulty: 'Medium', topics: ['DSA', 'Binary Search'], proctored: false },
  ];

  const filtered = activeTab === 'all' ? assessments : assessments.filter(a => a.type === activeTab);

  const difficultyColor = { Easy: 'badge-success', Medium: 'badge-warning', Hard: 'badge-danger' };
  const typeIcon = { mcq: ClipboardList, coding: Code2, mock: Target };

  /* Render active quiz */
  if (activeQuiz) {
    return (
      <ProtectedLayout title="Assessment in Progress" allowedRoles={['student']}>
        <ProctoredMCQQuiz
          quiz={{ id: activeQuiz.id, title: activeQuiz.title, questions: SAMPLE_MCQ }}
          onFinish={() => setActiveQuiz(null)}
        />
      </ProtectedLayout>
    );
  }

  /* Render start screen */
  if (startingQuiz) {
    return (
      <ProtectedLayout title="Assessment Setup" allowedRoles={['student']}>
        <AssessmentStartScreen
          assessment={startingQuiz}
          onStart={() => {
            setActiveQuiz(startingQuiz);
            setStartingQuiz(null);
          }}
          onCancel={() => setStartingQuiz(null)}
        />
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout title="Assessments" allowedRoles={['student']}>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Assessments</h1>
        <p className="page-subtitle">Topic-wise MCQs, coding challenges, and full mock placement tests — all AI-proctored.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-4 animate-fadeInUp" style={{ marginBottom: 24 }}>
        {[
          { icon: CheckCircle2, value: '23',  label: 'Completed',       color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
          { icon: BarChart3,    value: '78%', label: 'Avg. Score',       color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
          { icon: Flame,        value: '5',   label: 'Day Streak',       color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
          { icon: Trophy,       value: '#12', label: 'Leaderboard Rank', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div className="stat-icon" style={{ background: s.bg }}>
                <Icon size={18} color={s.color} />
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Tab Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, padding: '5px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
        {quizTypes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 8,
              background: activeTab === id ? 'var(--color-primary)' : 'transparent',
              color: activeTab === id ? 'white' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.15s',
            }}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Assessment List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="animate-fadeIn">
        {filtered.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '56px 32px' }}>
            <ClipboardList size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No assessments here</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No {activeTab} assessments available at this time.</p>
          </div>
        )}
        {filtered.map((a) => {
          const TypeIcon = typeIcon[a.type] || ClipboardList;
          const bgMap = { mcq: 'rgba(37,99,235,0.08)', coding: 'rgba(14,165,233,0.08)', mock: 'rgba(217,119,6,0.08)' };
          const colorMap = { mcq: '#2563eb', coding: '#0ea5e9', mock: '#d97706' };
          return (
            <div key={a.id} className="quiz-card">
              <div className="quiz-icon" style={{ background: bgMap[a.type] }}>
                <TypeIcon size={20} color={colorMap[a.type]} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{a.title}</span>
                  <span className={`badge ${difficultyColor[a.difficulty]}`}>{a.difficulty}</span>
                  {a.proctored && (
                    <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Shield size={9} /> Proctored
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    <ClipboardList size={12} /> {a.questions} questions
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    <Clock size={12} /> {a.time} min
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {a.topics.join(', ')}
                  </span>
                </div>
              </div>
              <button
                id={`start-btn-${a.id}`}
                className="btn btn-primary btn-sm"
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}
                onClick={() => {
                  if (a.type === 'coding') {
                    window.location.href = '/student/code';
                  } else {
                    setStartingQuiz(a);
                  }
                }}
              >
                {a.type === 'coding' ? 'Open Editor' : 'Start Test'} <ChevronRight size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ProtectedLayout>
  );
}
