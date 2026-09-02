import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, PieChart, Pie, Cell
} from 'recharts';
import { Activity, Shield, AlertTriangle, CheckCircle2, Sliders, Users, Eye, BarChart3, ExternalLink } from 'lucide-react';

const WEEKLY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKLY_SIGNUPS = [12, 8, 24, 19, 31, 7, 3];
const WEEKLY_LOGINS  = [84, 71, 102, 98, 125, 42, 18];
const MAX_LOGIN = Math.max(...WEEKLY_LOGINS);

const BAR_COLORS = ['#2563eb', '#0ea5e9', '#d97706', '#dc2626'];

const TOP_STUDENTS = [
  { rank: 1, name: 'Rahul Sharma', dept: 'CSE', points: 2100, streak: 14 },
  { rank: 2, name: 'John Doe',     dept: 'CSE', points: 1240, streak: 9  },
  { rank: 3, name: 'Sarah Johnson',dept: 'ECE', points: 980,  streak: 5  },
  { rank: 4, name: 'Priya Patel',  dept: 'MECH',points: 310,  streak: 1  },
];

// Sample proctoring telemetry data for admin timeline analysis
const PROCTORING_TIMELINE = Array.from({ length: 30 }, (_, i) => {
  const m = Math.floor(i * 1.5);
  const timeLabel = `${String(m).padStart(2, '0')}:00`;
  let mag = Math.floor(15 + Math.random() * 20);
  let isWarning = false;
  let dir = 'CENTER';

  if (i === 8) { mag = 68; isWarning = true; dir = 'RIGHT'; }
  if (i === 15) { mag = 74; isWarning = true; dir = 'LEFT'; }
  if (i === 22) { mag = 82; isWarning = true; dir = 'DOWN'; }

  return {
    timeLabel,
    magnitudePct: mag,
    direction: dir,
    yaw: (dir === 'RIGHT' ? 22.4 : dir === 'LEFT' ? -19.2 : 2.1).toFixed(1),
    pitch: (dir === 'DOWN' ? 14.8 : -2.1).toFixed(1),
    roll: 1.2,
    isWarning,
    confidence: 0.94
  };
});

const DISTRIBUTION_DATA = [
  { name: 'Normal (0-20%)',       value: 86, color: '#16a34a' },
  { name: 'Low Movement (20-40%)', value: 8,  color: '#3b82f6' },
  { name: 'Moderate (40-70%)',    value: 4,  color: '#d97706' },
  { name: 'High Movement (70%+)',  value: 2,  color: '#dc2626' },
];

export default function AdminAnalytics() {
  const [tab, setTab] = useState('proctoring');
  const [threshold, setThreshold] = useState(45);

  return (
    <ProtectedLayout title="Analytics & Proctoring Intelligence" allowedRoles={['admin']}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { id: 'proctoring',  label: 'AI Proctoring Intelligence', icon: Shield },
          { id: 'overview',    label: 'Overview & Users',          icon: Users },
          { id: 'engagement',  label: 'Weekly Activity',           icon: Activity },
          { id: 'leaderboard', label: 'Top Performers',            icon: BarChart3 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`btn btn-sm ${tab === id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── PROCTORING INTELLIGENCE TAB ── */}
      {tab === 'proctoring' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Summary Stat Bar */}
          <div className="grid grid-4">
            {[
              { icon: Shield,        value: '98.4%', label: 'Session Integrity Rate', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
              { icon: Activity,      value: '14.2%', label: 'Avg Face Movement',      color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
              { icon: AlertTriangle, value: '3',     label: 'Total Flagged Events',   color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
              { icon: Eye,           value: '94.2%', label: 'Model Confidence Avg',   color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
                  <div className="stat-icon" style={{ background: s.bg }}>
                    <Icon size={18} color={s.color} />
                  </div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-3">
            {/* Timeline Analysis */}
            <div className="card col-span-2">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Candidate Face Movement Timeline</h2>
                  <p className="card-subtitle">Real-time normalized head movement magnitude over session duration</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sliders size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Threshold: {threshold}%</span>
                </div>
              </div>

              <div style={{ height: 220, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PROCTORING_TIMELINE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="timeLabel" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                            borderRadius: 8, padding: '10px 14px', fontSize: '0.78rem', boxShadow: 'var(--shadow-lg)'
                          }}>
                            <div style={{ fontWeight: 800, marginBottom: 4 }}>{d.timeLabel} {d.isWarning ? '⚠️ WARNING' : ''}</div>
                            <div>Movement: <strong>{d.magnitudePct}%</strong></div>
                            <div>Direction: {d.direction}</div>
                            <div>Yaw / Pitch: {d.yaw}° / {d.pitch}°</div>
                            <div>Confidence: {Math.round(d.confidence * 100)}%</div>
                          </div>
                        );
                      }}
                    />
                    <ReferenceLine y={threshold} stroke="#d97706" strokeDasharray="4 4" label={{ value: 'Warning Limit', fill: '#d97706', fontSize: 10 }} />
                    <Area type="monotone" dataKey="magnitudePct" stroke="#2563eb" strokeWidth={2} fill="url(#adminGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Pie Chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Movement Severity Distribution</h2>
                  <p className="card-subtitle">Session breakdown across threshold zones</p>
                </div>
              </div>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={DISTRIBUTION_DATA} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {DISTRIBUTION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                {DISTRIBUTION_DATA.map(d => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                      {d.name}
                    </span>
                    <span style={{ fontWeight: 700 }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Event Log Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Proctoring Telemetry Events</h2>
                <p className="card-subtitle">Logged metadata events stored in Firestore</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link to="/admin/proctoring-report" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                  <ExternalLink size={12} /> Candidate Report
                </Link>
                <span className="badge badge-primary">3 Events Logged</span>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>Direction</th>
                  <th>Magnitude</th>
                  <th>Head Yaw</th>
                  <th>Head Pitch</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { time: '12:12:00', type: 'FACE_MOVEMENT', dir: 'RIGHT', mag: '68%', yaw: '+22.4°', pitch: '-2.1°', conf: '94%' },
                  { time: '12:22:30', type: 'FACE_MOVEMENT', dir: 'LEFT',  mag: '74%', yaw: '-19.2°', pitch: '-2.1°', conf: '96%' },
                  { time: '12:33:00', type: 'FACE_MOVEMENT', dir: 'DOWN',  mag: '82%', yaw: '+2.1°',  pitch: '+14.8°', conf: '92%' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.time}</td>
                    <td><span className="badge badge-warning">⚠ {row.type}</span></td>
                    <td style={{ fontWeight: 700 }}>{row.dir}</td>
                    <td style={{ fontWeight: 800, color: 'var(--color-warning)' }}>{row.mag}</td>
                    <td style={{ fontFamily: 'monospace' }}>{row.yaw}</td>
                    <td style={{ fontFamily: 'monospace' }}>{row.pitch}</td>
                    <td style={{ fontWeight: 600 }}>{row.conf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <>
          <div className="grid grid-4 mb-xl">
            {[
              { val: '3,492', label: 'Total Users',     sub: '↑ 245 this month', color: '#2563eb' },
              { val: '5',     label: 'Active Courses',  sub: '3 published', color: '#0ea5e9' },
              { val: '3',     label: 'Active Quizzes',  sub: '2,512 total attempts', color: '#d97706' },
              { val: '74%',   label: 'Avg Quiz Score',  sub: 'Across all assessments', color: '#16a34a' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
                <div className="stat-value">{s.val}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-change">{s.sub}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── ENGAGEMENT TAB ── */}
      {tab === 'engagement' && (
        <div className="card">
          <h3 className="card-title mb-md">Weekly Activity (Last 7 Days)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 160, marginBottom: 8 }}>
            {WEEKLY.map((day, i) => (
              <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{WEEKLY_LOGINS[i]}</div>
                <div style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  height: `${(WEEKLY_LOGINS[i] / MAX_LOGIN) * 130}px`,
                  background: 'linear-gradient(to top, #2563eb, #60a5fa)',
                  transition: 'height 0.5s ease',
                }} />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{day}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LEADERBOARD TAB ── */}
      {tab === 'leaderboard' && (
        <div className="card">
          <h3 className="card-title mb-md">Top Students Platform-wide</h3>
          <table className="data-table">
            <thead><tr><th>Rank</th><th>Name</th><th>Department</th><th>Skill Points</th><th>Streak</th></tr></thead>
            <tbody>
              {TOP_STUDENTS.map(s => (
                <tr key={s.rank}>
                  <td style={{ fontWeight: 700 }}>#{s.rank}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.dept}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{s.points.toLocaleString()} pts</td>
                  <td>🔥 {s.streak} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ProtectedLayout>
  );
}
