import { useNavigate } from 'react-router-dom';
import ProtectedLayout from '../../components/layout/ProtectedLayout';

const RECENT_SIGNUPS = [
  { email: 'john.doe@demo.com', role: 'Student', when: '2 mins ago', status: 'active' },
  { email: 'prof.smith@university.edu', role: 'Faculty', when: '1 hour ago', status: 'pending' },
  { email: 'sarah.j@demo.com', role: 'Student', when: '3 hours ago', status: 'active' },
];

const exportCSV = (rows) => {
  const headers = ['Email', 'Role', 'Joined', 'Status'];
  const lines = [headers.join(','), ...rows.map(r => [r.email, r.role, r.when, r.status].join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `recent_signups_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <ProtectedLayout title="Admin Portal" allowedRoles={['admin']}>
      <div className="grid grid-4 mb-xl">
        <div className="stat-card">
          <div className="stat-icon">🌍</div>
          <div className="stat-value">3,492</div>
          <div className="stat-label">Total Users</div>
          <div className="stat-change">↑ 245 this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏫</div>
          <div className="stat-value">42</div>
          <div className="stat-label">Faculty Members</div>
          <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>Stable</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛡️</div>
          <div className="stat-value">99.9%</div>
          <div className="stat-label">System Uptime</div>
          <div className="stat-change">All systems operational</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-value">12</div>
          <div className="stat-label">Active Subscriptions</div>
          <div className="stat-change">↑ 2 new domains</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-bold">Recent Signups</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-accent btn-sm" onClick={() => exportCSV(RECENT_SIGNUPS)}>📥 Export CSV</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/users')}>View All Users</button>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_SIGNUPS.map((u, i) => (
                <tr key={i}>
                  <td className="font-semibold text-primary">{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.when}</td>
                  <td>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: u.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: u.status === 'active' ? '#10b981' : '#f59e0b', border: `1px solid ${u.status === 'active' ? '#10b98155' : '#f59e0b55'}` }}>
                      {u.status === 'active' ? 'Verified' : 'Pending Review'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="font-bold mb-md">System Health & Alerts</h3>
          <div className="flex flex-col gap-sm">
            <div className="p-md border rounded bg-glass" style={{ borderColor: 'var(--color-accent)' }}>
              <div className="font-bold text-accent">✅ Database Connection Stable</div>
              <div className="text-sm text-secondary">Latency: 42ms. 0 errors in the last 24h.</div>
            </div>
            <div className="p-md border rounded bg-glass" style={{ borderColor: 'var(--color-warning)' }}>
              <div className="font-bold text-warning">⚠️ High API Usage Detected</div>
              <div className="text-sm text-secondary">Code execution service is at 85% capacity.</div>
            </div>
            <div className="p-md border rounded bg-glass" style={{ borderColor: 'var(--color-primary)' }}>
              <div className="font-bold text-primary">🔄 New Version Available</div>
              <div className="text-sm text-secondary">Update v2.4.1 is ready to be deployed.</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
