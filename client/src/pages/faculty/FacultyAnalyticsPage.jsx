import ProtectedLayout from '../../components/layout/ProtectedLayout';

export default function FacultyAnalyticsPage() {
  return (
    <ProtectedLayout title="Analytics & Reports" allowedRoles={['faculty']}>
      <div className="grid grid-2 mb-lg">
        <div className="card">
          <h3 className="font-bold mb-md">Average Scores by Assessment</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingTop: '20px' }}>
            {[65, 82, 74, 91, 88].map((h, i) => (
              <div key={i} style={{ flex: 1, background: 'var(--color-primary)', height: `${h}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 'bold' }}>{h}%</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
            {['Quiz 1', 'Midterm', 'Quiz 2', 'Project', 'Final'].map((l, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{l}</div>
            ))}
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-bold mb-md">Student Engagement</h3>
          <div className="flex flex-col gap-md">
            <div>
              <div className="flex justify-between text-sm mb-xs">
                <span>Active Daily</span>
                <span className="font-bold text-accent">78%</span>
              </div>
              <div className="progress-bar-container progress-bar-accent">
                <div className="progress-bar-fill" style={{ width: '78%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-xs">
                <span>Completed All Assignments</span>
                <span className="font-bold text-primary">64%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: '64%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-xs">
                <span>At Risk (Low Activity)</span>
                <span className="font-bold text-danger">12%</span>
              </div>
              <div className="progress-bar-container progress-bar-warning">
                <div className="progress-bar-fill" style={{ width: '12%', background: 'var(--color-danger)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
