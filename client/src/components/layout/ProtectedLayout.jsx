import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function ProtectedLayout({ children, title, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-float" style={{ fontSize: '3rem', marginBottom: '16px' }}>🎯</div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading PlacePrep...</p>
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
        <Topbar title={title} />
        <div className="page-container animate-fadeIn">
          {children}
        </div>
      </div>
    </div>
  );
}
