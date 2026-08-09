import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '', batch: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const user = await register(form);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left Panel ── */}
      <div className="auth-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60 }}>
          <div style={{
            width: 36, height: 36, background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
            borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
          }}>
            <Shield size={18} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc', letterSpacing: '-0.01em' }}>
            AssessHub
          </span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{
            fontSize: '2.4rem', fontWeight: 900, color: '#f8fafc',
            lineHeight: 1.15, marginBottom: 18, letterSpacing: '-0.03em',
          }}>
            Start your<br />
            <span style={{ color: '#60a5fa' }}>assessment</span><br />
            journey.
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, maxWidth: 340, marginBottom: 40 }}>
            Create your free AssessHub account and access AI-proctored assessments, coding challenges, and real-time scoring.
          </p>
          {[
            'Free account, no credit card needed',
            'Secure and private by default',
            'Instant access to all assessments',
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(59,130,246,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ color: '#94a3b8', fontSize: '0.855rem', fontWeight: 500 }}>{f}</span>
            </div>
          ))}
        </div>
        <p style={{ color: '#334155', fontSize: '0.78rem', marginTop: 40 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#60a5fa', fontWeight: 600 }}>Sign in →</Link>
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-header">
            <div className="auth-logo">
              <Shield size={20} color="white" strokeWidth={2.5} />
            </div>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Join AssessHub today — it's free</p>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 9,
              background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: 8, padding: '11px 14px', marginBottom: 18,
              color: 'var(--color-danger)', fontSize: '0.855rem',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          {/* Google first */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="btn btn-secondary w-full"
            style={{ justifyContent: 'center', padding: '10px 20px', marginBottom: 8 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider-text">or register with email</div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" name="name" id="reg-name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" required />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" name="role" id="reg-role" value={form.role} onChange={handleChange}>
                  <option value="student">Candidate / Student</option>
                  <option value="faculty">Recruiter / Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" name="email" id="reg-email" value={form.email} onChange={handleChange} placeholder="you@email.com" required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="reg-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                />
                <span className="input-icon-right" onClick={() => setShowPassword(v => !v)} role="button" aria-label="Toggle password">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Department <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <input className="form-input" name="department" id="reg-dept" value={form.department} onChange={handleChange} placeholder="CSE / IT / ECE" />
              </div>
              <div className="form-group">
                <label className="form-label">Batch Year <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <input className="form-input" name="batch" id="reg-batch" value={form.batch} onChange={handleChange} placeholder="2025" />
              </div>
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              className="btn btn-primary w-full btn-lg"
              disabled={loading}
              style={{ justifyContent: 'center', marginTop: 4 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Creating account…
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  Create Account <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
