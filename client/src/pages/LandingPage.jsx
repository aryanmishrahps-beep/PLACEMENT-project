import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { Shield, ArrowRight, CheckCircle, BarChart3, Camera, Zap, Users, Clock, Star } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role) navigate(`/${user.role}/dashboard`);
  }, [user, navigate]);

  const features = [
    {
      icon: Camera,
      title: 'AI Proctoring',
      desc: 'Real-time computer vision monitors candidates via webcam. Automatic violation detection and session locking.',
      color: '#2563eb',
      bg: 'rgba(37,99,235,0.08)',
    },
    {
      icon: BarChart3,
      title: 'Instant Analytics',
      desc: 'Live dashboards track candidate progress, scores, violation history, and completion rates in real time.',
      color: '#0ea5e9',
      bg: 'rgba(14,165,233,0.08)',
    },
    {
      icon: Zap,
      title: 'Auto-Grading',
      desc: 'MCQ and coding assessments are scored instantly. Results are delivered the moment a candidate submits.',
      color: '#16a34a',
      bg: 'rgba(22,163,74,0.08)',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Candidates assessed', icon: Users },
    { value: '99.9%', label: 'Platform uptime', icon: Zap },
    { value: '< 2s', label: 'Result delivery', icon: Clock },
    { value: '4.9 / 5', label: 'Recruiter rating', icon: Star },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 64,
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
            borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
          }}>
            <Shield size={17} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
            AssessHub
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 18px', borderRadius: 8, background: 'transparent',
              border: '1.5px solid #e2e8f0', color: '#475569',
              fontSize: '0.855rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '8px 18px', borderRadius: 8,
              background: '#2563eb', color: 'white',
              fontSize: '0.855rem', fontWeight: 600, cursor: 'pointer',
              border: 'none', boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{
        background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 55%, #1e293b 100%)',
        padding: '100px 48px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* subtle geometric bg */}
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: '30%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 60 }}>
          {/* Left copy */}
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(59,130,246,0.35)',
              borderRadius: 999, padding: '5px 14px', marginBottom: 28,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#60a5fa', animation: 'pulse 1.5s ease infinite' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#93c5fd', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Professional Assessment Platform
              </span>
            </div>

            <h1 style={{
              fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.12,
              color: '#f8fafc', marginBottom: 22, letterSpacing: '-0.03em',
            }}>
              Smart Assessments.<br />
              <span style={{ color: '#60a5fa' }}>Built for Better</span><br />
              Hiring.
            </h1>

            <p style={{
              fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.7,
              maxWidth: 460, marginBottom: 36,
            }}>
              Conduct secure, AI-proctored placement tests and technical evaluations with real-time monitoring, instant scoring, and detailed analytics.
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px', borderRadius: 10,
                  background: '#2563eb', color: 'white',
                  fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                  border: 'none', boxShadow: '0 4px 18px rgba(37,99,235,0.5)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Get Started <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/register')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.08)', color: '#e2e8f0',
                  fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                Explore Platform
              </button>
            </div>

            {/* Trust indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 40 }}>
              {['No credit card required', 'Enterprise-grade security', 'GDPR compliant'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={14} color="#22c55e" />
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Assessment Dashboard Preview */}
          <div style={{ flexShrink: 0, animation: 'float 6s ease-in-out infinite' }}>
            <div style={{
              width: 340, background: '#0f1929',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 18, overflow: 'hidden',
              boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            }}>
              {/* header bar */}
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#0c1220',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Shield size={14} color="#60a5fa" />
                  <span style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 700 }}>Frontend Developer Assessment</span>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)',
                  borderRadius: 999, padding: '3px 9px',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s ease infinite' }} />
                  <span style={{ color: '#4ade80', fontSize: '0.68rem', fontWeight: 700 }}>PROCTORED</span>
                </div>
              </div>
              {/* timer row */}
              <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Question 12 of 40</span>
                <span style={{
                  fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', color: '#f1f5f9',
                  background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: 6,
                }}>42:18</span>
              </div>
              {/* progress bar */}
              <div style={{ padding: '0 16px 14px' }}>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '30%', background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)', borderRadius: 99 }} />
                </div>
              </div>
              {/* question preview */}
              <div style={{ padding: '0 16px 14px' }}>
                <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: 14 }}>
                  Which React hook is best suited for managing complex state logic with multiple sub-values?
                </p>
                {['useState with object', 'useReducer', 'useContext', 'useMemo'].map((opt, i) => (
                  <div key={i} style={{
                    padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${i === 1 ? 'rgba(37,99,235,0.6)' : 'rgba(255,255,255,0.07)'}`,
                    background: i === 1 ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.03)',
                    marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: i === 1 ? '#2563eb' : 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 800,
                      color: i === 1 ? 'white' : '#64748b',
                    }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span style={{ color: i === 1 ? '#93c5fd' : '#94a3b8', fontSize: '0.75rem', fontWeight: i === 1 ? 600 : 400 }}>{opt}</span>
                  </div>
                ))}
              </div>
              {/* footer */}
              <div style={{
                padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#0c1220',
              }}>
                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>11 answered</span>
                <button style={{
                  padding: '6px 14px', borderRadius: 6, background: '#2563eb',
                  color: 'white', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                }}>Next →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '40px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <Icon size={20} color="#2563eb" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginTop: 3 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 48px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: 999,
              background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
              color: '#2563eb', fontSize: '0.78rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16,
            }}>Platform Capabilities</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 12 }}>
              Everything you need for<br />professional assessments
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
              From AI-powered proctoring to real-time analytics — one platform for your entire hiring evaluation workflow.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{
                  background: '#ffffff', border: '1px solid #e8edf2',
                  borderRadius: 16, padding: '28px 24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = `rgba(37,99,235,0.25)`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e8edf2'; }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: f.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                  }}>
                    <Icon size={22} color={f.color} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '80px 48px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc', marginBottom: 14, letterSpacing: '-0.03em' }}>
          Ready to transform your hiring?
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: 36 }}>
          Join thousands of companies running secure, intelligent assessments on AssessHub.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '13px 32px', borderRadius: 10, background: '#2563eb', color: 'white',
              fontSize: '1rem', fontWeight: 700, cursor: 'pointer', border: 'none',
              boxShadow: '0 4px 18px rgba(37,99,235,0.5)',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; }}
          >
            Start Free <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '13px 32px', borderRadius: 10,
              background: 'rgba(255,255,255,0.08)', color: '#e2e8f0',
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid rgba(255,255,255,0.15)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          >
            Sign In
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        background: '#0c1220', borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={15} color="#3b82f6" />
          <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>AssessHub</span>
        </div>
        <span style={{ color: '#334155', fontSize: '0.78rem' }}>© 2026 AssessHub. Professional Assessment Platform.</span>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
      `}</style>
    </div>
  );
}
