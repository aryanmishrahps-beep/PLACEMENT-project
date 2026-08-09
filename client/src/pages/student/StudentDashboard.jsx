import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useAuth } from '../../context/AuthContext';
import { useLiveStream } from '../../context/LiveStreamContext';
import { useNavigate } from 'react-router-dom';
import { MODULES, SAMPLE_BADGES } from '../../data/seedData';
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
  { title: 'NPTEL DAA Assignment 1', type: 'mock', score: 88, time: '1h ago' },
  { title: 'DSA: Arrays & Sorting', type: 'quiz', score: 88, time: '2h ago' },
  { title: 'DBMS MCQ Test', type: 'mcq', score: 92, time: '5h ago' },
  { title: 'Mock Placement Test', type: 'mock', score: 76, time: '1d ago' },
];

const stats = [
  { icon: '📚', value: '12', label: 'Courses Enrolled', change: '+2 this week', color: 'var(--color-primary)' },
  { icon: '📝', value: '47', label: 'Quizzes & NPTEL Tests', change: '+5 this week', color: 'var(--color-accent)' },
  { icon: '⭐', value: '2,840', label: 'Skill Points', change: '+150 today', color: 'var(--color-warning)' },
  { icon: '🏅', value: '3/6', label: 'Badges Earned', change: '1 new badge!', color: '#a855f7' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const { activeStream } = useLiveStream();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good Morning' : hour < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';

  return (
    <ProtectedLayout title="Student Dashboard" allowedRoles={['student', 'faculty', 'admin']}>
      {/* Active Live Stream Notification Widget */}
      {activeStream?.isLive && (
        <div className="card mb-lg p-md animate-fadeInUp" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(99,102,241,0.1) 100%)', border: '1px solid rgba(239,68,68,0.4)' }}>
          <div className="flex justify-between items-center flex-wrap gap-md">
            <div className="flex items-center gap-md">
              <span className="badge" style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', fontWeight: 'bold' }}>
                🔴 LIVE NOW IN CLASSROOM
              </span>
              <div>
                <h3 className="font-bold text-md">{activeStream.title}</h3>
                <p className="text-xs text-secondary">Instructor: {activeStream.hostName} • 👥 {activeStream.viewersCount} Students watching</p>
              </div>
            </div>
            <button className="btn btn-primary font-bold" onClick={() => navigate('/student/live/stream-dsa-live')}>
              ▶ Join Live Class Now
            </button>
          </div>
        </div>
      )}

      {/* Welcome */}
      <div className="page-header flex justify-between items-center flex-wrap gap-md">
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0] || 'Student'}! 👋</h1>
          <p className="page-subtitle">Ready to crack your placement? Explore NPTEL tests & live lectures.</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-secondary flex items-center gap-xs" onClick={() => navigate('/student/lectures')}>
            📹 Video Lectures
          </button>
          <button className="btn btn-primary flex items-center gap-xs" onClick={() => navigate('/student/nptel-tests')}>
            📝 NPTEL DSA & DAA Mock Tests
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-4 animate-fadeInUp" style={{ marginBottom: '24px' }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Main Grid: Charts & Modules */}
      <div className="grid grid-3" style={{ marginBottom: '24px' }}>
        {/* Radar & Progress */}
        <div className="card col-span-2">
          <div className="card-header">
            <div>
              <h2 className="card-title">Skill Proficiency Breakdown</h2>
              <p className="card-subtitle font-sans">Based on your recent assessment scores</p>
            </div>
            <span className="badge badge-accent">Overall: 75.8%</span>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Radar name="Proficiency" dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Trend */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Weekly Momentum</h2>
              <p className="card-subtitle font-sans">Score trend across 7 days</p>
            </div>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis domain={[50, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="score" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modules & Badges */}
      <div className="grid grid-2" style={{ marginBottom: '24px' }}>
        {/* Learning Modules */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Placement Prep Modules</h2>
              <p className="card-subtitle font-sans">Continue where you left off</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/courses')}>View All</button>
          </div>
          <div className="flex flex-col gap-sm">
            {MODULES.slice(0, 3).map((m) => (
              <div key={m.id} className="p-sm rounded flex items-center justify-between" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div>
                  <div className="font-bold text-sm">{m.title}</div>
                  <div className="text-xs text-secondary">{m.topicsCount} Topics • {m.completedTopics} Completed</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/student/courses/${m.id}`)}>Continue</button>
              </div>
            ))}
          </div>
        </div>

        {/* NPTEL & Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Recent Activity & Submissions</h2>
              <p className="card-subtitle font-sans">Your recent test performance</p>
            </div>
          </div>
          <div className="flex flex-col gap-sm">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex justify-between items-center p-xs border-b">
                <div>
                  <div className="font-semibold text-sm">{act.title}</div>
                  <div className="text-xs text-secondary">{act.time}</div>
                </div>
                <span className="badge badge-accent font-bold">{act.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
