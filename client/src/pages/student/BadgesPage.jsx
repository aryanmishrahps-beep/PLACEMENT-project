import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { SAMPLE_BADGES } from '../../data/seedData';

const allBadges = [
  ...SAMPLE_BADGES,
  { id: 7, name: 'Mock Expert', description: 'Completed 5 mock placement tests', icon: '🎯', earned: false },
  { id: 8, name: 'Network Ninja', description: 'Completed Computer Networks module', icon: '🌐', earned: false },
  { id: 9, name: 'DB Wizard', description: 'Scored 95%+ on DBMS test', icon: '🗄️', earned: false },
  { id: 10, name: 'Month Warrior', description: '30-day coding streak', icon: '🌟', earned: false },
  { id: 11, name: 'Full Stack Hero', description: 'Completed Full Stack project domain', icon: '🦸', earned: false },
  { id: 12, name: 'Interview Ready', description: 'Completed Interview Prep module', icon: '🎤', earned: false },
];

const earnedCount = allBadges.filter(b => b.earned).length;

export default function BadgesPage() {
  return (
    <ProtectedLayout title="My Badges" allowedRoles={['student']}>
      <div className="page-header">
        <h1 className="page-title">🏅 My Badges</h1>
        <p className="page-subtitle">Collect badges by completing modules, passing tests, and maintaining streaks.</p>
      </div>

      {/* Progress */}
      <div className="card animate-fadeInUp" style={{
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(239,68,68,0.06) 100%)',
        border: '1px solid rgba(245,158,11,0.25)',
      }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
          <div>
            <div className="font-bold text-xl">{earnedCount} / {allBadges.length} Badges Earned</div>
            <div className="text-muted text-sm">{allBadges.length - earnedCount} more to unlock</div>
          </div>
          <div style={{ fontSize: '3rem' }}>🏅</div>
        </div>
        <div className="progress-bar-container" style={{ height: '8px' }}>
          <div className="progress-bar-fill progress-bar-warning"
            style={{ width: `${(earnedCount / allBadges.length) * 100}%`, background: 'var(--gradient-warm)' }} />
        </div>
        <div className="text-xs text-muted" style={{ marginTop: '6px' }}>
          {Math.round((earnedCount / allBadges.length) * 100)}% complete
        </div>
      </div>

      {/* Earned Badges */}
      <div className="animate-fadeInUp animate-delay-1" style={{ marginBottom: '32px' }}>
        <h2 className="text-xl font-bold" style={{ marginBottom: '16px' }}>
          ✅ Earned Badges <span className="badge badge-accent" style={{ marginLeft: '8px' }}>{earnedCount}</span>
        </h2>
        <div className="grid grid-4">
          {allBadges.filter(b => b.earned).map((b, i) => (
            <div key={b.id} className={`achievement-badge earned animate-delay-${(i % 4) + 1}`}
              style={{ padding: '24px 16px', cursor: 'default' }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px', animation: 'float 4s ease-in-out infinite' }}>
                {b.icon}
              </div>
              <div className="achievement-name" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>{b.name}</div>
              <div className="achievement-desc" style={{ fontSize: '0.75rem' }}>{b.description}</div>
              <div className="badge badge-warning" style={{ marginTop: '8px', fontSize: '0.65rem' }}>Earned ✓</div>
            </div>
          ))}
        </div>
      </div>

      {/* Locked Badges */}
      <div className="animate-fadeInUp animate-delay-2">
        <h2 className="text-xl font-bold" style={{ marginBottom: '16px' }}>
          🔒 Locked Badges <span className="badge badge-muted" style={{ marginLeft: '8px' }}>{allBadges.length - earnedCount}</span>
        </h2>
        <div className="grid grid-4">
          {allBadges.filter(b => !b.earned).map((b, i) => (
            <div key={b.id} className={`achievement-badge animate-delay-${(i % 4) + 1}`}
              style={{ padding: '24px 16px', cursor: 'default', opacity: 0.45 }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px', filter: 'grayscale(1)' }}>{b.icon}</div>
              <div className="achievement-name" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>{b.name}</div>
              <div className="achievement-desc" style={{ fontSize: '0.75rem' }}>{b.description}</div>
              <div className="badge badge-muted" style={{ marginTop: '8px', fontSize: '0.65rem' }}>🔒 Locked</div>
            </div>
          ))}
        </div>
      </div>

      {/* How to Earn */}
      <div className="card animate-fadeInUp animate-delay-3" style={{ marginTop: '32px' }}>
        <h3 className="font-bold text-lg" style={{ marginBottom: '16px' }}>💡 How to Earn Badges</h3>
        <div className="grid grid-2" style={{ gap: '12px' }}>
          {[
            { icon: '📚', tip: 'Complete training modules to unlock subject-specific badges.' },
            { icon: '📝', tip: 'Score 90%+ on quizzes to earn Quiz Champion and similar badges.' },
            { icon: '🔥', tip: 'Maintain daily coding streaks for Week Warrior and Month Warrior.' },
            { icon: '🎯', tip: 'Finish mock placement tests to unlock Mock Expert badge.' },
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-md" style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{t.icon}</span>
              <p className="text-sm text-secondary">{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedLayout>
  );
}
