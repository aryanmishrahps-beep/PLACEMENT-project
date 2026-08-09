import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  return (
    <header className="topbar">
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
      </div>

      <div className="topbar-search">
        <span style={{ color: 'var(--text-muted)' }}>🔍</span>
        <input
          type="text"
          placeholder="Search courses, quizzes..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
        />
      </div>

      <div className="topbar-actions">
        {user?.role === 'student' && (
          <>
            <div className="streak-chip">
              🔥 {user?.streak || 0} day streak
            </div>
            <div className="points-chip">
              ⭐ {user?.skill_points || 0} pts
            </div>
          </>
        )}
        <button
          className="topbar-badge-btn"
          onClick={() => navigate(`/${user?.role}/notifications`)}
          title="Notifications"
        >
          🔔
          <span className="badge-dot" />
        </button>
        <div
          className="user-avatar"
          style={{ cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navigate(`/${user?.role}/profile`)}
        >
          {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
