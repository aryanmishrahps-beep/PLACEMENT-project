import { useState } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useAuth } from '../../context/AuthContext';
import { useLiveStream } from '../../context/LiveStreamContext';
import { useNavigate } from 'react-router-dom';
import UploadLectureModal from '../../components/faculty/UploadLectureModal';
import GoLiveModal from '../../components/faculty/GoLiveModal';
import { Users, BookOpen, FileText, Radio, Plus, Upload, TrendingUp, Clock } from 'lucide-react';

const assessments = [
  { title: 'NPTEL DAA Assignment 1',       submissions: '112/124', avg: '84%', status: 'active' },
  { title: 'Data Structures Midterm',      submissions: '98/124',  avg: '76%', status: 'draft' },
  { title: 'SQL & Relational Algebra',     submissions: '124/124', avg: '92%', status: 'completed' },
  { title: 'Operating Systems MCQ',        submissions: '67/124',  avg: '71%', status: 'active' },
];

const topStudents = [
  { name: 'Alice Smith',    score: '98%', rank: 1, dept: 'CSE' },
  { name: 'Bob Johnson',    score: '95%', rank: 2, dept: 'IT' },
  { name: 'Charlie Brown',  score: '94%', rank: 3, dept: 'CSE' },
  { name: 'Diana Prince',   score: '91%', rank: 4, dept: 'ECE' },
];

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { activeStream } = useLiveStream();
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);

  const statusBadge = { active: 'badge-success', draft: 'badge-warning', completed: 'badge-muted' };

  return (
    <ProtectedLayout title="Faculty Dashboard" allowedRoles={['faculty', 'admin']}>

      {/* Live Banner */}
      {activeStream?.isLive && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)',
              borderRadius: 999, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 800, color: '#dc2626',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', animation: 'pulse 1.5s ease infinite' }} />
              Live
            </span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{activeStream.title}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {activeStream.viewersCount} students watching
              </p>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/faculty/live-studio')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Radio size={13} /> Open Studio
          </button>
        </div>
      )}

      {/* Welcome + Actions */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(14,165,233,0.04) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Professor'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Manage your assessments, upload lectures, and engage with students.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setIsUploadOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Upload size={14} /> Upload Lecture
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/faculty/quizzes/create')}
              style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Plus size={14} /> Create Assessment
            </button>
            <button
              onClick={() => setIsGoLiveOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-danger)', color: 'white', border: 'none', cursor: 'pointer',
                fontSize: '0.855rem', fontWeight: 600, fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#b91c1c'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-danger)'; }}
            >
              <Radio size={14} /> Go Live
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        {[
          { icon: Users,    value: '124', label: 'Active Students',   change: '↑ 12% this month', color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
          { icon: BookOpen, value: '8',   label: 'Courses Managed',   change: 'All active',        color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', neutral: true },
          { icon: FileText, value: '45',  label: 'Assessments Created', change: '↑ 3 this week',  color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div className="stat-icon" style={{ background: s.bg }}>
                <Icon size={20} color={s.color} />
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-change" style={s.neutral ? { color: 'var(--text-muted)' } : {}}>{s.change}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-2">
        {/* Assessments Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Recent Assessments</h2>
              <p className="card-subtitle">Submission tracking and scores</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/faculty/quizzes/create')}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Plus size={13} /> New
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Submissions</th>
                <th>Avg.</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, maxWidth: 160 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.title}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{a.submissions}</td>
                  <td style={{ fontWeight: 700 }}>{a.avg}</td>
                  <td><span className={`badge ${statusBadge[a.status]}`}>{a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Students */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Top Performers</h2>
              <p className="card-subtitle">Highest scoring students this month</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/faculty/students')}>All Students</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {topStudents.map(student => (
              <div key={student.rank} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className={`leaderboard-rank rank-${student.rank}`}>{student.rank}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{student.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{student.dept}</div>
                </div>
                <span style={{
                  fontWeight: 800, fontSize: '0.9rem',
                  color: parseInt(student.score) >= 95 ? 'var(--color-success)' : parseInt(student.score) >= 90 ? 'var(--color-warning)' : 'var(--text-primary)',
                }}>
                  {student.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <UploadLectureModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <GoLiveModal isOpen={isGoLiveOpen} onClose={() => setIsGoLiveOpen(false)} />

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </ProtectedLayout>
  );
}
