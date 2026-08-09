import { useNavigate } from 'react-router-dom';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { Users, UserCheck, CheckCircle2, AlertTriangle, TrendingUp, Activity, Shield, Zap } from 'lucide-react';

const RECENT_SIGNUPS = [
  { email: 'john.doe@demo.com',          role: 'Candidate', when: '2 mins ago',  status: 'active' },
  { email: 'prof.smith@university.edu',   role: 'Recruiter', when: '1 hour ago',  status: 'pending' },
  { email: 'sarah.j@demo.com',           role: 'Candidate', when: '3 hours ago', status: 'active' },
];

const exportCSV = (rows) => {
  const headers = ['Email', 'Role', 'Joined', 'Status'];
  const lines = [headers.join(','), ...rows.map(r => [r.email, r.role, r.when, r.status].join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `signups_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const stats = [
  { icon: Users,      value: '3,492', label: 'Total Users',        change: '+245 this month', color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  { icon: UserCheck,  value: '42',    label: 'Recruiters',         change: 'Stable',          color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', neutral: true },
  { icon: Shield,     value: '99.9%', label: 'System Uptime',      change: 'All systems OK',  color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
  { icon: Zap,        value: '12',    label: 'Active Assessments', change: '+2 new today',    color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
];

const recentAssessments = [
  { name: 'Frontend Developer',  candidates: 124, completed: 98,  status: 'active' },
  { name: 'Backend Developer',   candidates: 86,  completed: 74,  status: 'active' },
  { name: 'Data Analyst',        candidates: 62,  completed: 62,  status: 'completed' },
  { name: 'DevOps Engineer',     candidates: 38,  completed: 21,  status: 'active' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <ProtectedLayout title="Admin Dashboard" allowedRoles={['admin']}>
      {/* Stat Cards */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div className="stat-icon" style={{ background: s.bg }}>
                <Icon size={20} color={s.color} />
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-change" style={s.neutral ? { color: 'var(--text-muted)' } : {}}>{s.change}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-2">
        {/* Recent Assessments */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Active Assessments</h2>
              <p className="card-subtitle">Currently running evaluations</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/content')}>View All</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Candidates</th>
                <th>Completed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAssessments.map((a, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td>{a.candidates}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{a.completed}</span>
                      <div style={{ flex: 1, height: 4, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden', minWidth: 60 }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          background: 'var(--color-primary)',
                          width: `${Math.round((a.completed / a.candidates) * 100)}%`,
                        }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {Math.round((a.completed / a.candidates) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${a.status === 'active' ? 'badge-success' : 'badge-muted'}`}>
                      {a.status === 'active' ? 'Active' : 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recent Signups */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Recent Signups</h2>
                <p className="card-subtitle">Latest registered users</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => exportCSV(RECENT_SIGNUPS)}>Export CSV</button>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/users')}>View All</button>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_SIGNUPS.map((u, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.855rem' }}>{u.email}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.when}</div>
                    </td>
                    <td><span className="badge badge-muted">{u.role}</span></td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {u.status === 'active' ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* System Health */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 14 }}>System Health</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                {
                  icon: CheckCircle2, color: 'var(--color-success)', bg: 'rgba(22,163,74,0.06)',
                  border: 'rgba(22,163,74,0.2)', title: 'Database Stable',
                  desc: 'Latency: 42ms · 0 errors in 24h',
                },
                {
                  icon: AlertTriangle, color: 'var(--color-warning)', bg: 'rgba(217,119,6,0.06)',
                  border: 'rgba(217,119,6,0.2)', title: 'High API Usage',
                  desc: 'Code execution at 85% capacity',
                },
                {
                  icon: TrendingUp, color: 'var(--color-primary)', bg: 'rgba(37,99,235,0.06)',
                  border: 'rgba(37,99,235,0.2)', title: 'Update Available',
                  desc: 'Platform v2.4.1 ready to deploy',
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 12px', borderRadius: 8,
                    background: item.bg, border: `1px solid ${item.border}`,
                  }}>
                    <Icon size={15} color={item.color} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 1 }}>{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
