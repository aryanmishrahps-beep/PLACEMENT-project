import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Eye, EyeOff, ArrowRight, GraduationCap, BookOpen, Settings, AlertCircle } from 'lucide-react';

const ROLES = [
  { id: 'student', label: 'Candidate',  Icon: GraduationCap, desc: 'Sign in to access your assigned assessments' },
  { id: 'faculty', label: 'Recruiter',  Icon: BookOpen,       desc: 'Manage assessments and review candidate results' },
  { id: 'admin',   label: 'Admin',      Icon: Settings,       desc: 'Full platform control and user management' },
];

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.pathname.includes('/faculty')) setSelectedRole('faculty');
    else if (location.pathname.includes('/admin')) setSelectedRole('admin');
    else setSelectedRole('student');
  }, [location.pathname]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      navigate(`/${user.role || selectedRole}/dashboard`);
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
      navigate(`/${user.role || selectedRole}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (role) => {
    const demos = {
      student: { id: 1, name: 'Rahul Sharma', email: 'student@demo.com', role: 'student', department: 'CSE', batch: '2025', skillPoints: 2840, streak: 5 },
      faculty: { id: 2, name: 'Dr. Rajesh Sharma', email: 'faculty@demo.com', role: 'faculty', department: 'CSE' },
      admin:   { id: 3, name: 'Admin User', email: 'admin@demo.com', role: 'admin' },
    };
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('pp_token', `mock_demo_token_${role}`);
      localStorage.setItem('pp_user', JSON.stringify(demos[role]));
      window.location.href = `/${role}/dashboard`;
    }, 300);
  };

  const roleInfo = ROLES.find(r => r.id === selectedRole);

  return (
    <div className="auth-page">
      {/* ── Left Panel ── */}
      <div className="auth-left">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
            borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
          }}>
            <Shield size={18} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc', letterSpacing: '-0.01em' }}>
            AssessHub
          </span>
        </div>

        {/* Headline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{
            fontSize: '2.6rem', fontWeight: 900, color: '#f8fafc',
            lineHeight: 1.15, marginBottom: 18, letterSpacing: '-0.03em',
          }}>
            Secure.<br />
            <span style={{ color: '#60a5fa' }}>Intelligent.</span><br />
            Professional.
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, maxWidth: 340, marginBottom: 48 }}>
            The complete platform for running AI-proctored assessments, placement tests, and technical evaluations.
          </p>

          {/* Feature bullets */}
          {[
            'Real-time AI proctoring via webcam',
            'Instant automated scoring & grading',
            'Comprehensive analytics & reports',
            'Firestore-backed session integrity',
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(59,130,246,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ color: '#94a3b8', fontSize: '0.855rem', fontWeight: 500 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <p style={{ color: '#334155', fontSize: '0.78rem', marginTop: 40 }}>
          © 2026 AssessHub — Enterprise Assessment Platform
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-right">
        <div className="auth-form-container">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <Shield size={20} color="white" strokeWidth={2.5} />
            </div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your AssessHub account</p>
          </div>

          {/* Role Selector */}
          <div style={{
            display: 'flex', gap: 6, marginBottom: 28,
            background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', padding: 5,
          }}>
            {ROLES.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedRole(id)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '8px 4px', borderRadius: 7,
                  background: selectedRole === id ? 'var(--bg-surface)' : 'transparent',
                  border: selectedRole === id ? '1px solid var(--border-default)' : '1px solid transparent',
                  color: selectedRole === id ? 'var(--color-primary)' : 'var(--text-muted)',
                  boxShadow: selectedRole === id ? 'var(--shadow-xs)' : 'none',
                  cursor: 'pointer', transition: 'all 0.15s',
                  fontSize: '0.72rem', fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Role description */}
          <p style={{
            fontSize: '0.8rem', color: 'var(--text-secondary)',
            marginBottom: 22, padding: '8px 12px',
            background: 'var(--bg-base)', borderRadius: 8,
            border: '1px solid var(--border-subtle)',
          }}>
            {roleInfo?.desc}
          </p>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 9,
              background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: 8, padding: '11px 14px', marginBottom: 18, color: 'var(--color-danger)',
              fontSize: '0.855rem',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                name="email"
                id="login-email"
                value={form.email}
                onChange={handleChange}
                placeholder={`your@email.com`}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="login-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <span
                  className="input-icon-right"
                  onClick={() => setShowPassword(v => !v)}
                  role="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </span>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="btn btn-primary w-full btn-lg"
              disabled={loading}
              style={{ marginTop: 4, position: 'relative', justifyContent: 'center' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  Sign In <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider-text">or</div>

          {/* Google login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-secondary w-full"
            style={{ justifyContent: 'center', padding: '10px 20px', marginBottom: 20 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Demo Access */}
          <div style={{
            padding: '14px', borderRadius: 10,
            background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
            marginBottom: 20,
          }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Quick Demo Access
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              {ROLES.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => demoLogin(id)}
                  style={{
                    flex: 1, padding: '7px 4px', borderRadius: 7, fontSize: '0.755rem',
                    fontWeight: 700, cursor: 'pointer', border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface)', color: 'var(--text-secondary)',
                    transition: 'all 0.15s', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.855rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Create account
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
