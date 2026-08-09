import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Shield } from 'lucide-react';

export default function ProtectedLayout({ children, title, allowedRoles }) {
  const { user, loading } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('ah_theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('ah_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg-base)', flexDirection: 'column', gap: '16px'
      }}>
        <div style={{
          width: 48, height: 48,
          background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
          animation: 'pulse 1.5s ease infinite'
        }}>
          <Shield size={22} color="white" strokeWidth={2.5} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>AssessHub</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading your workspace…</p>
        </div>
        {/* Skeleton preview */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          {[60, 80, 50].map((w, i) => (
            <div key={i} className="skeleton skeleton-text" style={{ width: w, height: 10 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!user || !user.role) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title={title} darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
        <div className="page-container animate-fadeIn">
          {children}
        </div>
      </div>
    </div>
  );
}
