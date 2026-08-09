import { useState } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';

const INITIAL_COURSES = [
  { id: 1, title: 'Data Structures & Algorithms', category: 'DSA', students: 284, status: 'published', updated: '2 days ago' },
  { id: 2, title: 'Database Management System', category: 'DBMS', students: 197, status: 'published', updated: '5 days ago' },
  { id: 3, title: 'Operating System Concepts', category: 'OS', students: 143, status: 'draft', updated: '1 week ago' },
  { id: 4, title: 'Computer Networks', category: 'CN', students: 211, status: 'published', updated: '3 days ago' },
  { id: 5, title: 'OOP with Java', category: 'OOP', students: 98, status: 'draft', updated: '2 weeks ago' },
];

const INITIAL_QUIZZES = [
  { id: 1, title: 'DSA Mock Test - Sorting', type: 'coding', attempts: 512, avgScore: '74%', status: 'active' },
  { id: 2, title: 'DBMS Theory MCQ', type: 'mcq', attempts: 382, avgScore: '68%', status: 'active' },
  { id: 3, title: 'OS Interview Questions', type: 'mcq', attempts: 291, avgScore: '71%', status: 'draft' },
];

const STATUS_COLOR = {
  published: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  active: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  draft: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
};

const Pill = ({ status }) => {
  const cfg = STATUS_COLOR[status] || { bg: '#222', color: '#fff' };
  return (
    <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}55` }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function AdminContentManagement() {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = '#10b981') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const addCourse = () => {
    const title = prompt('Enter Course Title:');
    if (!title) return;
    const newCourse = {
      id: Date.now(),
      title,
      category: 'NEW',
      students: 0,
      status: 'draft',
      updated: 'Just now'
    };
    setCourses([...courses, newCourse]);
    showToast(`Added new course: ${title}`);
  };

  const deleteCourse = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      setCourses(courses.filter(c => c.id !== id));
      showToast(`Deleted course: ${title}`, '#ef4444');
    }
  };

  const addQuiz = () => {
    const title = prompt('Enter Quiz Title:');
    if (!title) return;
    const newQuiz = {
      id: Date.now(),
      title,
      type: 'mcq',
      attempts: 0,
      avgScore: '0%',
      status: 'draft'
    };
    setQuizzes([...quizzes, newQuiz]);
    showToast(`Added new quiz: ${title}`);
  };

  const deleteQuiz = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      setQuizzes(quizzes.filter(q => q.id !== id));
      showToast(`Deleted quiz: ${title}`, '#ef4444');
    }
  };

  return (
    <ProtectedLayout title="Content Management" allowedRoles={['admin']}>
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 999, background: toast.color, color: '#fff', padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* Courses Section */}
      <div className="card mb-xl">
        <div className="flex justify-between items-center mb-md">
          <h3 className="font-bold" style={{ fontSize: '1.05rem' }}>📚 Courses</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-accent btn-sm" onClick={addCourse}>+ Add Course</button>
          </div>
        </div>
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr><th>Title</th><th>Category</th><th>Enrolled</th><th>Status</th><th>Last Updated</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No courses found.</td></tr>
            ) : courses.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.title}</td>
                <td><span style={{ padding: '2px 10px', borderRadius: 12, background: 'rgba(99,102,241,0.12)', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600 }}>{c.category}</span></td>
                <td style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{c.students} students</td>
                <td><Pill status={c.status} /></td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{c.updated}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => showToast(`Editing functionality coming soon for: ${c.title}`)}>Edit</button>
                    <button className="btn btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid #ef444455' }} onClick={() => deleteCourse(c.id, c.title)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quizzes Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-md">
          <h3 className="font-bold" style={{ fontSize: '1.05rem' }}>📝 Quizzes & Assessments</h3>
          <button className="btn btn-accent btn-sm" onClick={addQuiz}>+ Add Quiz</button>
        </div>
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr><th>Title</th><th>Type</th><th>Attempts</th><th>Avg Score</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {quizzes.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No quizzes found.</td></tr>
            ) : quizzes.map(q => (
              <tr key={q.id}>
                <td style={{ fontWeight: 600 }}>{q.title}</td>
                <td><span style={{ padding: '2px 10px', borderRadius: 12, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>{q.type}</span></td>
                <td style={{ color: 'var(--text-secondary)' }}>{q.attempts.toLocaleString()}</td>
                <td style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{q.avgScore}</td>
                <td><Pill status={q.status} /></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => showToast(`Editing functionality coming soon for: ${q.title}`)}>Edit</button>
                    <button className="btn btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid #ef444455' }} onClick={() => deleteQuiz(q.id, q.title)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedLayout>
  );
}
