import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.pathname.includes('/faculty')) {
      setSelectedRole('faculty');
    } else if (location.pathname.includes('/admin')) {
      setSelectedRole('admin');
    } else {
      setSelectedRole('student');
    }
  }, [location.pathname]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      const targetRole = user.role || selectedRole;
      navigate(`/${targetRole}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      const targetRole = selectedRole !== 'student' ? selectedRole : (user.role || 'student');
      navigate(`/${targetRole}/dashboard`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  // Instant Portal Demo Login for Student, Faculty, and Admin
  const demoLogin = (role) => {
    const demos = {
      student: { id: 1, name: 'Demo Student', email: 'student@demo.com', role: 'student', department: 'CSE', batch: '2025', skillPoints: 2840, streak: 5 },
      faculty: { id: 2, name: 'Dr. Rajesh Sharma', email: 'faculty@demo.com', role: 'faculty', department: 'CSE' },
      admin: { id: 3, name: 'Demo Admin', email: 'admin@demo.com', role: 'admin' },
    };
    
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('pp_token', `mock_demo_token_${role}`);
      localStorage.setItem('pp_user', JSON.stringify(demos[role]));
      window.location.href = `/${role}/dashboard`;
    }, 300);
  };

  const getPortalInfo = () => {
    if (selectedRole === 'faculty') return { title: 'Faculty Portal Sign In', icon: '👨‍🏫', desc: 'Access your courses, upload lectures & host live streams' };
    if (selectedRole === 'admin') return { title: 'Admin Control Center', icon: '⚙️', desc: 'Manage users, placements, analytics and system settings' };
    return { title: 'Student Portal Sign In', icon: '🎓', desc: 'Sign in to access your courses, mock tests & live classes' };
  };

  const portal = getPortalInfo();

  return (
    <div className="auth-page">
      <div className="auth-bg" />

      {/* Floating background orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%', width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        animation: 'float 6s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '8%', width: 200, height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
        animation: 'float 8s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />

      <div className="auth-card animate-fadeInUp" style={{ maxWidth: 480 }}>
        {/* Role Selector Tabs (Student / Faculty / Admin) */}
        <div className="flex rounded p-xs mb-md" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'student', label: '🎓 Student' },
            { id: 'faculty', label: '👨‍🏫 Faculty' },
            { id: 'admin', label: '⚙️ Admin' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRole(tab.id)}
              className={`btn flex-1 text-xs font-semibold ${selectedRole === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 4px',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="auth-header">
          <div className="auth-logo">{portal.icon}</div>
          <h1 className="auth-title">{portal.title}</h1>
          <p className="auth-subtitle">{portal.desc}</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '16px',
            color: 'var(--color-danger)',
            fontSize: '0.875rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{selectedRole.toUpperCase()} Email Address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={selectedRole === 'faculty' ? 'faculty@college.edu' : selectedRole === 'admin' ? 'admin@college.edu' : 'student@college.edu'}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? '⏳ Signing in...' : `🚀 Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
          </button>
          
          <button type="button" onClick={handleGoogleLogin} className="btn btn-secondary w-full flex items-center justify-center gap-sm btn-lg" disabled={loading}
            style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🌐</span> Sign in with Google
          </button>
        </form>

        <div className="divider" style={{ margin: '20px 0' }} />

        {/* Instant Role Portal Demo Buttons for Client Showcase */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '8px', fontWeight: 600 }}>
            ⚡ Instant Role Access (Client Demo Showcase)
          </p>
          <div className="flex gap-sm">
            {['student', 'faculty', 'admin'].map((role) => (
              <button key={role} onClick={() => demoLogin(role)}
                className={`btn btn-sm w-full ${selectedRole === role ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize', fontSize: '0.75rem', padding: '8px 4px' }}>
                {role === 'student' ? '🎓' : role === 'faculty' ? '👨‍🏫' : '⚙️'} {role}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
