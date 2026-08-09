import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const studentNav = [
  { label: 'Dashboard', icon: '📊', path: '/student/dashboard' },
  { label: 'Live Classroom', icon: '🔴', path: '/student/live/stream-dsa-live' },
  { label: 'Video Lectures', icon: '📹', path: '/student/lectures' },
  { label: 'NPTEL DSA & DAA', icon: '📝', path: '/student/nptel-tests' },
  { label: 'My Courses', icon: '📚', path: '/student/courses' },
  { label: 'Assessments', icon: '📋', path: '/student/assessments' },
  { label: 'Code Editor', icon: '💻', path: '/student/code' },
  { label: 'Leaderboard', icon: '🏆', path: '/student/leaderboard' },
  { label: 'My Badges', icon: '🏅', path: '/student/badges' },
];

const facultyNav = [
  { label: 'Dashboard', icon: '📊', path: '/faculty/dashboard' },
  { label: 'Live Studio', icon: '🔴', path: '/faculty/live-studio' },
  { label: 'Manage Courses', icon: '📚', path: '/faculty/courses' },
  { label: 'Create Quiz', icon: '➕', path: '/faculty/quizzes/create' },
  { label: 'Analytics', icon: '📈', path: '/faculty/analytics' },
  { label: 'Students', icon: '👥', path: '/faculty/students' },
];

const adminNav = [
  { label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
  { label: 'User Management', icon: '👥', path: '/admin/users' },
  { label: 'Content Management', icon: '📋', path: '/admin/content' },
  { label: 'Analytics', icon: '📈', path: '/admin/analytics' },
  { label: 'Settings', icon: '⚙️', path: '/admin/settings' },
];

const navByRole = { student: studentNav, faculty: facultyNav, admin: adminNav };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = navByRole[user?.role] || studentNav;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="sidebar-logo-icon">🎯</div>
        <div>
          <div className="sidebar-logo-text">PlacePrep</div>
          <div className="sidebar-logo-sub">Training Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map((item) => (
          <div
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={() => navigate(`/${user?.role}/dashboard`)}>
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">{user?.name}</div>
            <div className="user-role" style={{ textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
        <button
          className="btn btn-danger btn-sm w-full mt-sm"
          onClick={logout}
          style={{ marginTop: '8px' }}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
