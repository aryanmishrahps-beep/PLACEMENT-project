import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useAuth } from '../../context/AuthContext';
import { useLiveStream } from '../../context/LiveStreamContext';
import { useNavigate } from 'react-router-dom';
import { MODULES, SAMPLE_BADGES } from '../../data/seedData';
import { TrendingUp, BookOpen, FileText, Award, Zap, ArrowRight, Radio, Clock } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const radarData = [
  { subject: 'DSA', A: 72 }, { subject: 'DBMS', A: 85 }, { subject: 'OS', A: 60 },
  { subject: 'CN', A: 78 }, { subject: 'OOP', A: 90 }, { subject: 'Aptitude', A: 65 },
];

const activityData = [
  { day: 'Mon', score: 68 }, { day: 'Tue', score: 82 }, { day: 'Wed', score: 75 },
  { day: 'Thu', score: 91 }, { day: 'Fri', score: 88 }, { day: 'Sat', score: 95 }, { day: 'Sun', score: 79 },
];

const recentActivity = [
  { title: 'NPTEL DAA Assignment 1', type: 'Mock Test',  score: 88, time: '1h ago',  status: 'pass' },
  { title: 'DSA: Arrays & Sorting',  type: 'MCQ Quiz',   score: 88, time: '2h ago',  status: 'pass' },
  { title: 'DBMS MCQ Test',          type: 'MCQ Test',   score: 92, time: '5h ago',  status: 'pass' },
  { title: 'Mock Placement Test',    type: 'Mock Test',  score: 76, time: '1d ago',  status: 'warning' },
];

const stats = [
  { icon: BookOpen, value: '12', label: 'Courses Enrolled', change: '+2 this week', accent: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  { icon: FileText, value: '47',   label: 'Tests Completed',   change: '+5 this week', accent: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
  { icon: Zap,      value: '2,840',label: 'Skill Points',       change: '+150 today',   accent: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  { icon: Award,    value: '3/6',  label: 'Badges Earned',      change: '1 new badge',  accent: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const { activeStream } = useLiveStream();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <ProtectedLayout title="Dashboard" allowedRoles={['student', 'faculty', 'admin']}>

      {/* Live Stream Banner */}
      {activeStream?.isLive && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)',
          borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 999, padding: '4px 12px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', animation: 'pulse 1.5s ease infinite' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{activeStream.title}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {activeStream.hostName} · {activeStream.viewersCount} watching
              </p>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/student/live/stream-dsa-live')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Radio size={13} /> Join Now
          </button>
        </div>
      )}

      {/* Welcome Header */}
      <div className="page-header flex justify-between items-center flex-wrap gap-md">
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
          <p className="page-subtitle">Ready to prepare for your placement? Continue where you left off.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/lectures')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Radio size={13} /> Lectures
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/student/nptel-tests')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={13} /> NPTEL Tests
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card" style={{ borderLeft: `3px solid ${s.accent}` }}>
              <div className="stat-icon" style={{ background: s.bg }}>
                <Icon size={20} color={s.accent} />
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-change">{s.change}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        {/* Radar */}
        <div className="card col-span-2">
          <div className="card-header">
            <div>
              <h2 className="card-title">Skill Proficiency</h2>
              <p className="card-subtitle">Based on your recent assessment performance</p>
            </div>
            <span className="badge badge-primary">Overall 75.8%</span>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: "'Plus Jakarta Sans'" }} />
                <Radar name="Proficiency" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Weekly Score</h2>
              <p className="card-subtitle">Trend across last 7 days</p>
            </div>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis domain={[50, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="score" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-2">
        {/* Learning Modules */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Placement Prep Modules</h2>
              <p className="card-subtitle">Continue where you left off</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/courses')}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(MODULES || []).slice(0, 3).map((m) => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 2 }}>{m.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.topicsCount} topics · {m.completedTopics} completed</div>
                  <div style={{ height: 3, background: 'var(--border-subtle)', borderRadius: 99, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round((m.completedTopics / m.topicsCount) * 100)}%`, background: '#2563eb', borderRadius: 99 }} />
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" style={{ marginLeft: 12, flexShrink: 0 }}
                  onClick={() => navigate(`/student/courses/${m.id}`)}>Continue</button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Recent Activity</h2>
              <p className="card-subtitle">Your latest test submissions</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/assessments')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>All Tests <ArrowRight size={12} /></span>
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentActivity.map((act, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 0', borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 2 }}>{act.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{act.type}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>·</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <Clock size={10} /> {act.time}
                    </span>
                  </div>
                </div>
                <span style={{
                  fontWeight: 800, fontSize: '0.875rem', minWidth: 48, textAlign: 'right',
                  color: act.score >= 85 ? 'var(--color-success)' : act.score >= 70 ? 'var(--color-warning)' : 'var(--color-danger)',
                }}>
                  {act.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </ProtectedLayout>
  );
}
