import { useState } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useAuth } from '../../context/AuthContext';
import { useLiveStream } from '../../context/LiveStreamContext';
import { useNavigate } from 'react-router-dom';
import UploadLectureModal from '../../components/faculty/UploadLectureModal';
import GoLiveModal from '../../components/faculty/GoLiveModal';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { activeStream } = useLiveStream();
  const navigate = useNavigate();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);

  return (
    <ProtectedLayout title="Faculty Dashboard" allowedRoles={['faculty', 'admin']}>
      {/* Active Broadcast Banner if Live */}
      {activeStream?.isLive && (
        <div className="card mb-lg p-md animate-fadeInUp" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(99,102,241,0.1) 100%)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div className="flex justify-between items-center flex-wrap gap-md">
            <div className="flex items-center gap-md">
              <span className="badge" style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', fontWeight: 'bold' }}>
                🔴 LIVE STREAM ACTIVE
              </span>
              <div>
                <h3 className="font-bold text-md">{activeStream.title}</h3>
                <p className="text-xs text-secondary">👥 {activeStream.viewersCount} Students watching in real-time</p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/faculty/live-studio')}>
              🎙️ Open Broadcast Studio
            </button>
          </div>
        </div>
      )}

      {/* Faculty Action Header Bar */}
      <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(16,185,129,0.08) 100%)' }}>
        <div className="flex justify-between items-center flex-wrap gap-md">
          <div>
            <h2 className="text-xl font-bold">Welcome, {user?.name || 'Professor'}</h2>
            <p className="text-secondary text-sm">Manage lectures, create assessments, and stream live interactive classes.</p>
          </div>
          <div className="flex gap-sm flex-wrap">
            <button className="btn btn-secondary btn-lg flex items-center gap-xs" onClick={() => setIsUploadOpen(true)}>
              📹 Upload Video / Lecture
            </button>
            <button className="btn btn-primary btn-lg flex items-center gap-xs" style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={() => setIsGoLiveOpen(true)}>
              🔴 Go Live Streaming
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-3 mb-xl">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">124</div>
          <div className="stat-label">Active Students</div>
          <div className="stat-change">↑ 12% this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">8</div>
          <div className="stat-label">Courses Managed</div>
          <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>All active</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">45</div>
          <div className="stat-label">Quizzes & NPTEL Tests</div>
          <div className="stat-change">↑ 3 this week</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-bold">Recent Assessments & Tests</h3>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/faculty/quizzes/create')}>Create New</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Submissions</th>
                <th>Avg. Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold text-primary">NPTEL DAA Assignment 1</td>
                <td>112/124</td>
                <td>84%</td>
                <td><span className="badge badge-accent">Active</span></td>
              </tr>
              <tr>
                <td className="font-semibold text-primary">Data Structures Midterm</td>
                <td>98/124</td>
                <td>76%</td>
                <td><span className="badge badge-warning">Draft</span></td>
              </tr>
              <tr>
                <td className="font-semibold text-primary">SQL & Relational Algebra</td>
                <td>124/124</td>
                <td>92%</td>
                <td><span className="badge badge-muted">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="font-bold mb-md">Top Performing Students</h3>
          <div className="flex flex-col gap-sm">
            {[
              { name: 'Alice Smith', score: '98%', rank: 1 },
              { name: 'Bob Johnson', score: '95%', rank: 2 },
              { name: 'Charlie Brown', score: '94%', rank: 3 },
              { name: 'Diana Prince', score: '91%', rank: 4 },
            ].map(student => (
              <div key={student.rank} className="leaderboard-row">
                <div className={`leaderboard-rank rank-${student.rank}`}>{student.rank}</div>
                <div className="flex-1 font-semibold text-primary">{student.name}</div>
                <div className="font-bold">{student.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <UploadLectureModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <GoLiveModal isOpen={isGoLiveOpen} onClose={() => setIsGoLiveOpen(false)} />
    </ProtectedLayout>
  );
}
