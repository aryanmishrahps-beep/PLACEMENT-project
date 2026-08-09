import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '', batch: '' });
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
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card animate-fadeInUp" style={{ maxWidth: 500 }}>
        <div className="auth-header">
          <div className="auth-logo">🎯</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join PlacePrep and start your journey</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '16px',
            color: 'var(--color-danger)', fontSize: '0.875rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2" style={{ gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" required />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" name="role" value={form.role} onChange={handleChange}>
                <option value="student">🎓 Student</option>
                <option value="faculty">👨‍🏫 Faculty</option>
                <option value="admin">⚙️ Admin</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@college.edu" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required />
          </div>
          <div className="grid grid-2" style={{ gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" name="department" value={form.department} onChange={handleChange} placeholder="CSE / IT / ECE..." />
            </div>
            <div className="form-group">
              <label className="form-label">Batch Year</label>
              <input className="form-input" name="batch" value={form.batch} onChange={handleChange} placeholder="2024 / 2025..." />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? '⏳ Creating account...' : '✅ Create Account'}
          </button>

          <button type="button" onClick={handleGoogleSignup} className="btn btn-secondary w-full flex items-center justify-center gap-sm btn-lg" disabled={loading}
            style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🌐</span> Sign up with Google
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
