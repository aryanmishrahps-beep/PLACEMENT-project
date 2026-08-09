import { useState } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { nptelTests } from '../../data/nptelTestData';

export default function NPTELTestPage() {
  const [selectedTest, setSelectedTest] = useState(nptelTests[0]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('take'); // 'take' or 'review'

  const handleAnswerChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setActiveTab('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ProtectedLayout title="NPTEL Descriptive Mock Tests (DSA & DAA)" allowedRoles={['student', 'faculty', 'admin']}>
      {/* Header & Test Selector */}
      <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex justify-between items-center flex-wrap gap-md">
          <div>
            <div className="flex items-center gap-xs mb-xs">
              <span className="badge badge-accent">NPTEL Pattern</span>
              <span className="badge badge-primary">{selectedTest.course}</span>
            </div>
            <h2 className="text-xl font-bold">{selectedTest.title}</h2>
            <p className="text-secondary text-sm">Descriptive algorithmic trace, recurrence proofs & state derivations.</p>
          </div>
          <div className="flex gap-sm">
            <select
              className="form-select"
              style={{ minWidth: 260 }}
              value={selectedTest.id}
              onChange={(e) => {
                const test = nptelTests.find(t => t.id === e.target.value);
                setSelectedTest(test);
                setAnswers({});
                setSubmitted(false);
                setActiveTab('take');
              }}
            >
              {nptelTests.map(t => (
                <option key={t.id} value={t.id}>📚 {t.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mode Switcher if submitted */}
      {submitted && (
        <div className="flex gap-sm mb-lg">
          <button
            className={`btn ${activeTab === 'review' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('review')}
          >
            📋 Evaluation & Model Answers
          </button>
          <button
            className={`btn ${activeTab === 'take' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('take')}
          >
            ✍️ Edit Your Submissions
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Questions & Answer Inputs */}
        <div className="flex flex-col gap-lg">
          {selectedTest.questions.map((q, idx) => (
            <div key={q.id} className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div className="flex justify-between items-center mb-sm">
                <span className="badge badge-primary font-bold">Question {idx + 1} ({q.marks} Marks)</span>
                <span className="text-xs text-secondary font-semibold">Topic: {q.topic}</span>
              </div>

              <div className="mb-md p-md rounded" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {q.questionText}
              </div>

              {/* Student Answer Box */}
              <div className="form-group">
                <label className="form-label font-semibold">Your Answer & Step-by-Step Derivation:</label>
                <textarea
                  rows={6}
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                  placeholder={q.placeholder}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  disabled={submitted && activeTab === 'review'}
                />
              </div>

              {/* Evaluation & Model Solution view */}
              {submitted && activeTab === 'review' && (
                <div className="mt-md p-md rounded animate-fadeInUp" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <h4 className="font-bold text-success mb-xs">✅ NPTEL Model Answer & Evaluation Rubric:</h4>
                  
                  <div className="mb-sm p-sm rounded" style={{ background: 'var(--bg-card)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {q.modelAnswer}
                  </div>

                  <h5 className="font-semibold text-xs text-secondary mb-xs">Grading Rubric Breakdown:</h5>
                  <ul className="text-xs" style={{ paddingLeft: '20px', margin: 0 }}>
                    {q.rubric.map((r, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {!submitted && (
            <div className="flex justify-end mb-xl">
              <button onClick={handleSubmit} className="btn btn-primary btn-lg">
                🚀 Submit Test & View NPTEL Evaluation
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Info & Instructions */}
        <div className="flex flex-col gap-md">
          <div className="card">
            <h3 className="font-bold mb-sm">⏱️ Test Details</h3>
            <div className="flex justify-between items-center py-xs border-b">
              <span className="text-secondary text-sm">Duration:</span>
              <span className="font-bold">{selectedTest.durationMinutes} Minutes</span>
            </div>
            <div className="flex justify-between items-center py-xs border-b">
              <span className="text-secondary text-sm">Total Marks:</span>
              <span className="font-bold">{selectedTest.totalMarks} Marks</span>
            </div>
            <div className="flex justify-between items-center py-xs">
              <span className="text-secondary text-sm">Question Count:</span>
              <span className="font-bold">{selectedTest.questions.length} Descriptive</span>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold mb-sm">📌 NPTEL Guidelines</h3>
            <ul className="text-xs text-secondary flex flex-col gap-xs" style={{ paddingLeft: '16px' }}>
              {selectedTest.instructions.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
