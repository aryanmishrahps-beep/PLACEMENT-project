import { useState } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useAuth } from '../../context/AuthContext';

const mockLeaderboard = [
  { id: 1, name: 'Priya Sharma', department: 'CSE', batch: '2025', skill_points: 4820, streak: 24, badge: '🏆' },
  { id: 2, name: 'Rahul Verma', department: 'IT', batch: '2025', skill_points: 4560, streak: 18, badge: '🥈' },
  { id: 3, name: 'Ananya Singh', department: 'ECE', batch: '2025', skill_points: 4310, streak: 15, badge: '🥉' },
  { id: 4, name: 'Karthik Reddy', department: 'CSE', batch: '2024', skill_points: 4100, streak: 12, badge: null },
  { id: 5, name: 'Meera Iyer', department: 'IT', batch: '2025', skill_points: 3980, streak: 10, badge: null },
  { id: 6, name: 'Dev Patel', department: 'CSE', batch: '2025', skill_points: 3750, streak: 8, badge: null },
  { id: 7, name: 'Sneha Joshi', department: 'ECE', batch: '2024', skill_points: 3620, streak: 7, badge: null },
  { id: 8, name: 'Arjun Nair', department: 'IT', batch: '2025', skill_points: 3490, streak: 6, badge: null },
  { id: 9, name: 'Divya Kumar', department: 'CSE', batch: '2025', skill_points: 3340, streak: 5, badge: null },
  { id: 10, name: 'Rohan Gupta', department: 'IT', batch: '2024', skill_points: 3200, streak: 4, badge: null },
];

const rankStyles = [
  { bg: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.05) 100%)', border: 'rgba(255,215,0,0.3)', numColor: '#ffd700' },
  { bg: 'linear-gradient(135deg, rgba(192,192,192,0.12) 0%, rgba(192,192,192,0.04) 100%)', border: 'rgba(192,192,192,0.25)', numColor: '#c0c0c0' },
  { bg: 'linear-gradient(135deg, rgba(205,127,50,0.12) 0%, rgba(205,127,50,0.04) 100%)', border: 'rgba(205,127,50,0.25)', numColor: '#cd7f32' },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [activePeriod, setActivePeriod] = useState('All Time');

  const depts = ['All', 'CSE', 'IT', 'ECE', 'MECH'];
  const periods = ['All Time', 'This Month', 'This Week'];

  const myRank = 12; // mock

  return (
    <ProtectedLayout title="Leaderboard" allowedRoles={['student']}>
      <div className="page-header">
        <h1 className="page-title">🏆 Leaderboard</h1>
        <p className="page-subtitle">See where you stand among your peers. Rise through the ranks!</p>
      </div>

      {/* Your Rank Card */}
      <div className="card animate-fadeInUp" style={{
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.3)',
        display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem',
            boxShadow: 'var(--shadow-primary)',
          }}>
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
          </div>
          <div>
            <div className="font-bold text-lg">{user?.name}</div>
            <div className="text-muted text-sm">{user?.department} · Batch {user?.batch}</div>
          </div>
        </div>
        <div className="flex gap-xl" style={{ marginLeft: 'auto', flexWrap: 'wrap' }}>
          {[
            { icon: '📍', label: 'Your Rank', value: `#${myRank}` },
            { icon: '⭐', label: 'Skill Points', value: user?.skill_points || 2840 },
            { icon: '🔥', label: 'Streak', value: `${user?.streak || 5} days` },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
              <div className="font-bold text-xl" style={{ color: 'var(--color-primary-light)' }}>{s.value}</div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between animate-fadeInUp animate-delay-1" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div className="flex gap-sm">
          {depts.map((d) => (
            <button key={d} className={`btn btn-sm ${activeFilter === d ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveFilter(d)}>{d}</button>
          ))}
        </div>
        <div className="flex gap-sm">
          {periods.map((p) => (
            <button key={p} className={`btn btn-sm ${activePeriod === p ? 'btn-accent' : 'btn-secondary'}`}
              onClick={() => setActivePeriod(p)}>{p}</button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="animate-fadeInUp animate-delay-2" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '16px', height: '200px' }}>
          {/* 2nd */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🥈</div>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #c0c0c0, #888)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              {mockLeaderboard[1].name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="font-bold text-sm" style={{ marginBottom: '4px', textAlign: 'center' }}>{mockLeaderboard[1].name}</div>
            <div className="text-xs text-muted">{mockLeaderboard[1].skill_points} pts</div>
            <div style={{ width: '100%', height: '100px', background: 'rgba(192,192,192,0.15)', border: '1px solid rgba(192,192,192,0.25)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px', fontSize: '1.5rem', fontWeight: 800, color: '#c0c0c0' }}>2</div>
          </div>
          {/* 1st */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px', animation: 'float 3s ease-in-out infinite' }}>🏆</div>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg, #ffd700, #ff8c00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '1.1rem', marginBottom: '8px', boxShadow: '0 0 20px rgba(255,215,0,0.4)' }}>
              {mockLeaderboard[0].name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="font-bold" style={{ marginBottom: '4px', textAlign: 'center' }}>{mockLeaderboard[0].name}</div>
            <div className="text-xs" style={{ color: '#ffd700' }}>{mockLeaderboard[0].skill_points} pts</div>
            <div style={{ width: '100%', height: '140px', background: 'linear-gradient(180deg, rgba(255,215,0,0.2) 0%, rgba(255,165,0,0.1) 100%)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px', fontSize: '2rem', fontWeight: 900, color: '#ffd700' }}>1</div>
          </div>
          {/* 3rd */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🥉</div>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #cd7f32, #8b4513)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              {mockLeaderboard[2].name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="font-bold text-sm" style={{ marginBottom: '4px', textAlign: 'center' }}>{mockLeaderboard[2].name}</div>
            <div className="text-xs text-muted">{mockLeaderboard[2].skill_points} pts</div>
            <div style={{ width: '100%', height: '70px', background: 'rgba(205,127,50,0.12)', border: '1px solid rgba(205,127,50,0.25)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px', fontSize: '1.5rem', fontWeight: 800, color: '#cd7f32' }}>3</div>
          </div>
        </div>
      </div>

      {/* Full List */}
      <div className="card animate-fadeInUp animate-delay-3">
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>Department</th>
              <th>Streak</th>
              <th>Skill Points</th>
            </tr>
          </thead>
          <tbody>
            {mockLeaderboard.map((s, i) => {
              const isMe = s.name === user?.name;
              const style = i < 3 ? rankStyles[i] : null;
              return (
                <tr key={s.id} style={isMe ? { background: 'var(--color-primary-glow)' } : {}}>
                  <td>
                    <div className={`leaderboard-rank ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}`}>
                      {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-sm">
                      <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', background: isMe ? 'var(--gradient-primary)' : 'var(--bg-elevated)' }}>
                        {s.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{s.name} {isMe && <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>You</span>}</div>
                        <div className="text-xs text-muted">Batch {s.batch}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-muted">{s.department}</span></td>
                  <td><span className="streak-chip" style={{ fontSize: '0.75rem', padding: '2px 10px' }}>🔥 {s.streak}</span></td>
                  <td>
                    <div className="font-bold" style={{ color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--color-primary-light)' }}>
                      ⭐ {s.skill_points.toLocaleString()}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ProtectedLayout>
  );
}
