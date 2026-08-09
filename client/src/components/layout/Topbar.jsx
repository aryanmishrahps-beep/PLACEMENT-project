import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, ChevronDown, Menu } from 'lucide-react';

export default function Topbar({ title, darkMode, onToggleDark, onToggleSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <header className="topbar">
      {/* Left: Hamburger menu + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="topbar-hamburger-btn"
          onClick={onToggleSidebar}
          title="Toggle Navigation Menu"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      {/* Right: Actions */}
      <div className="topbar-actions">
        {/* Dark mode toggle */}
        <button
          className="topbar-icon-btn"
          onClick={onToggleDark}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button
          className="topbar-icon-btn"
          title="Notifications"
          aria-label="View notifications"
        >
          <Bell size={16} />
          <span className="badge-dot" />
        </button>

        {/* User chip */}
        <div
          className="topbar-user-chip"
          onClick={() => navigate(`/${user?.role}/dashboard`)}
          style={{ cursor: 'pointer' }}
        >
          <div className="topbar-avatar">{initials}</div>
          <span className="topbar-user-name">
            {user?.name?.split(' ')[0] || 'User'}
          </span>
          <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    </header>
  );
}
