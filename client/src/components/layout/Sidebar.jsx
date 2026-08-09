import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Radio, PlayCircle, FileText, BookOpen, ClipboardList,
  Code2, Trophy, Award, Users, BookMarked, PlusSquare, BarChart3,
  UserCog, Settings, ChevronRight, LogOut, Shield, X
} from 'lucide-react';

const studentNav = [
  { label: 'Dashboard',      icon: LayoutDashboard, path: '/student/dashboard' },
  { label: 'Live Classroom', icon: Radio,           path: '/student/live/stream-dsa-live' },
  { label: 'Video Lectures', icon: PlayCircle,      path: '/student/lectures' },
  { label: 'NPTEL Tests',    icon: FileText,        path: '/student/nptel-tests' },
  { label: 'My Courses',     icon: BookOpen,        path: '/student/courses' },
  { label: 'Assessments',    icon: ClipboardList,   path: '/student/assessments' },
  { label: 'Code Editor',    icon: Code2,           path: '/student/code' },
  { label: 'Leaderboard',    icon: Trophy,          path: '/student/leaderboard' },
  { label: 'My Badges',      icon: Award,           path: '/student/badges' },
];

const facultyNav = [
  { label: 'Dashboard',      icon: LayoutDashboard, path: '/faculty/dashboard' },
  { label: 'Live Studio',    icon: Radio,           path: '/faculty/live-studio' },
  { label: 'Courses',        icon: BookMarked,      path: '/faculty/courses' },
  { label: 'Create Quiz',    icon: PlusSquare,      path: '/faculty/quizzes/create' },
  { label: 'Analytics',      icon: BarChart3,       path: '/faculty/analytics' },
  { label: 'Students',       icon: Users,           path: '/faculty/students' },
];

const adminNav = [
  { label: 'Dashboard',       icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'User Management', icon: UserCog,         path: '/admin/users' },
  { label: 'Content',         icon: BookOpen,        path: '/admin/content' },
  { label: 'Analytics',       icon: BarChart3,       path: '/admin/analytics' },
  { label: 'Settings',        icon: Settings,        path: '/admin/settings' },
];

const navByRole = { student: studentNav, faculty: facultyNav, admin: adminNav };

const roleLabels = {
  student: 'Student Portal',
  faculty: 'Faculty Portal',
  admin: 'Admin Control'
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = navByRole[user?.role] || studentNav;
  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const handleNavClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div
        className="sidebar-logo"
        onClick={() => handleNavClick('/')}
        style={{ cursor: 'pointer', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="sidebar-logo-icon">
            <Shield size={18} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="sidebar-logo-text">AssessHub</div>
            <div className="sidebar-logo-sub">Assessment Platform</div>
          </div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            className="sidebar-mobile-close"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role Indicator */}
      <div style={{
        margin: '12px 12px 0',
        padding: '6px 10px',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(37, 99, 235, 0.12)',
        border: '1px solid rgba(37, 99, 235, 0.2)',
        fontSize: '0.68rem',
        fontWeight: 700,
        color: '#60a5fa',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {roleLabels[user?.role] || 'Portal'}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
            >
              <span className="nav-icon">
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              {item.label}
              {isActive && (
                <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div
          className="sidebar-user"
          onClick={() => handleNavClick(`/${user?.role}/dashboard`)}
        >
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role" style={{ textTransform: 'capitalize' }}>
              {user?.role || 'student'}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            marginTop: '8px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            color: '#fca5a5',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
