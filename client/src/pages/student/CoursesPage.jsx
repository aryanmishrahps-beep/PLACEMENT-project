import { useState } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { MODULES, COMPANY_TRACKS } from '../../data/seedData';
import { useNavigate } from 'react-router-dom';

const categories = ['All', 'Technical', 'Professional', 'Project'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDiff, setActiveDiff] = useState('All');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = MODULES.filter((m) => {
    const matchCat = activeCategory === 'All' || m.category === activeCategory.toLowerCase();
    const matchSearch = m.label.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <ProtectedLayout title="Training Modules" allowedRoles={['student']}>
      <div className="page-header">
        <h1 className="page-title">Training Modules 📚</h1>
        <p className="page-subtitle">Master technical fundamentals, professional skills, and domain projects.</p>
      </div>

      {/* Filters */}
      <div className="card animate-fadeInUp" style={{ marginBottom: '24px', padding: '16px' }}>
        <div className="flex items-center gap-md" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              className="form-input"
              placeholder="🔍 Search modules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '10px 14px' }}
            />
          </div>
          <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button key={c}
                className={`btn btn-sm ${activeCategory === c ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveCategory(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid grid-auto animate-fadeInUp animate-delay-1" style={{ marginBottom: '32px' }}>
        {filtered.map((m, i) => (
          <div key={m.id} className={`course-card animate-delay-${(i % 4) + 1}`}
            onClick={() => navigate(`/student/courses/${m.id}`)}>
            <div className="course-card-header"
              style={{
                position: 'relative',
                height: 140,
                overflow: 'hidden',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                background: '#0f172a',
              }}>
              <img
                src={m.image}
                alt={m.label}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.75,
                  transition: 'transform 0.4s ease, opacity 0.3s ease',
                }}
                className="course-cover-img"
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.85) 100%)`,
              }} />
              
              {/* Category Badge */}
              <span className={`badge badge-${m.category === 'technical' ? 'primary' : m.category === 'professional' ? 'accent' : 'warning'}`}
                style={{ position: 'absolute', top: 12, right: 12, backdropFilter: 'blur(4px)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {m.category}
              </span>

              {/* Floating Icon Pill */}
              <div style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}>
                {m.icon}
              </div>
            </div>
            <div className="course-card-body">
              <div className="course-card-title">{m.label}</div>
              <div className="course-card-desc">{m.desc}</div>
              <div style={{ marginBottom: '12px' }}>
                <div className="flex items-center justify-between text-xs text-muted" style={{ marginBottom: '4px' }}>
                  <span>Progress</span>
                  <span style={{ color: m.color }}>{Math.floor(Math.random() * 80 + 10)}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill"
                    style={{ width: `${Math.floor(Math.random() * 80 + 10)}%`, background: `linear-gradient(90deg, ${m.color}, ${m.color}99)` }} />
                </div>
              </div>
              <button className="btn btn-primary btn-sm w-full">Continue Learning →</button>
            </div>
          </div>
        ))}
      </div>

      {/* Company Tracks */}
      <div className="animate-fadeInUp animate-delay-2">
        <div className="flex items-center justify-between mb-md">
          <h2 className="text-xl font-bold">🏢 Company-Specific Tracks</h2>
          <span className="badge badge-accent">Professional</span>
        </div>
        <div className="grid grid-3">
          {COMPANY_TRACKS.map((c) => (
            <div key={c.id} className="card" style={{
              cursor: 'pointer',
              padding: 0,
              overflow: 'hidden',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
              onClick={() => navigate('/student/assessments')}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}>
              <div>
                {/* Header Banner */}
                <div style={{
                  height: 100,
                  position: 'relative',
                  background: '#0f172a',
                  overflow: 'hidden',
                }}>
                  <img
                    src={c.cover}
                    alt={c.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%)`,
                  }} />

                  {/* Brand Logo Container */}
                  <div style={{
                    position: 'absolute',
                    bottom: -20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    background: '#ffffff',
                    padding: '8px',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-card)',
                  }}>
                    <img
                      src={c.logo}
                      alt={`${c.name} logo`}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        // Fallback if logo fails
                        e.target.style.display = 'none';
                        e.target.parentNode.innerText = c.name.slice(0, 2);
                      }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '28px 16px 16px', textAlign: 'center' }}>
                  <div className="font-bold text-lg" style={{ color: 'var(--text-primary)', marginBottom: 2 }}>
                    {c.name}
                  </div>
                  <div className="text-xs text-muted" style={{ fontWeight: 500 }}>
                    Placement Track · {c.modules || 15} Practice Tests
                  </div>
                </div>
              </div>

              <div style={{ padding: '0 16px 16px' }}>
                <button className="btn btn-primary btn-sm w-full" style={{ justifyContent: 'center' }}>
                  Start Track →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedLayout>
  );
}
