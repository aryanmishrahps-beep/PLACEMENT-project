import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useState } from 'react';

const WEEKLY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKLY_SIGNUPS = [12, 8, 24, 19, 31, 7, 3];
const WEEKLY_LOGINS  = [84, 71, 102, 98, 125, 42, 18];
const MAX_LOGIN = Math.max(...WEEKLY_LOGINS);

const BAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const TOP_STUDENTS = [
  { rank: 1, name: 'Rahul Sharma', dept: 'CSE', points: 2100, streak: 14 },
  { rank: 2, name: 'John Doe',     dept: 'CSE', points: 1240, streak: 9  },
  { rank: 3, name: 'Sarah Johnson',dept: 'ECE', points: 980,  streak: 5  },
  { rank: 4, name: 'Priya Patel',  dept: 'MECH',points: 310,  streak: 1  },
];

export default function AdminAnalytics() {
  const [tab, setTab] = useState('overview');

  return (
    <ProtectedLayout title="Analytics & Reporting" allowedRoles={['admin']}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['overview', 'engagement', 'leaderboard'].map(t => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {/* Stats */}
          <div className="grid grid-4 mb-xl">
            {[
              { icon: '👥', val: '3,492', label: 'Total Users',     sub: '↑ 245 this month' },
              { icon: '📚', val: '5',     label: 'Active Courses',  sub: '3 published' },
              { icon: '📝', val: '3',     label: 'Active Quizzes',  sub: '2,512 total attempts' },
              { icon: '⚡', val: '74%',   label: 'Avg Quiz Score',  sub: 'Across all assessments' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.val}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-change">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Category Breakdown */}
          <div className="card mb-xl">
            <h3 className="font-bold mb-md">📊 Course Enrollment by Category</h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[['DSA', 284, 0], ['DBMS', 197, 1], ['CN', 211, 2], ['OS', 143, 3]].map(([name, val, ci]) => (
                <div key={name} style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600 }}>
                    <span>{name}</span><span>{val}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 6, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(val / 350) * 100}%`, background: BAR_COLORS[ci], borderRadius: 6, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'engagement' && (
        <div className="card">
          <h3 className="font-bold mb-md">📈 Weekly Activity (Last 7 Days)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 160, marginBottom: 8 }}>
            {WEEKLY.map((day, i) => (
              <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{WEEKLY_LOGINS[i]}</div>
                <div style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  height: `${(WEEKLY_LOGINS[i] / MAX_LOGIN) * 130}px`,
                  background: 'linear-gradient(to top, #6366f1, #818cf8)',
                  transition: 'height 0.5s ease',
                }} />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{day}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            {WEEKLY.map((day, i) => (
              <div key={day} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>+{WEEKLY_SIGNUPS[i]}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>signups</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="card">
          <h3 className="font-bold mb-md">🏆 Top Students Platform-wide</h3>
          <table className="data-table">
            <thead><tr><th>Rank</th><th>Name</th><th>Department</th><th>Skill Points</th><th>Streak</th></tr></thead>
            <tbody>
              {TOP_STUDENTS.map(s => (
                <tr key={s.rank}>
                  <td style={{ fontWeight: 700, color: s.rank === 1 ? '#f59e0b' : s.rank === 2 ? '#94a3b8' : s.rank === 3 ? '#cd7f32' : 'inherit' }}>
                    {s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : `#${s.rank}`}
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.dept}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{s.points.toLocaleString()} pts</td>
                  <td>🔥 {s.streak} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ProtectedLayout>
  );
}
