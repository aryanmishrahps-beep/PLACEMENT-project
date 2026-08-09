import { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine
} from 'recharts';
import { Activity, AlertTriangle, Shield, ChevronDown, ChevronUp } from 'lucide-react';

/* Custom Marker dot for Warning events */
const WarningDot = (props) => {
  const { cx, cy, payload } = props;
  if (!payload || !payload.isWarning) return null;
  return (
    <g transform={`translate(${cx},${cy})`}>
      <circle r="7" fill="#dc2626" opacity="0.25" className="animate-pulse" />
      <circle r="4" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
      <text y="-9" textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="800">
        ⚠
      </text>
    </g>
  );
};

/* Custom Tooltip Content */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      boxShadow: 'var(--shadow-lg)',
      fontSize: '0.78rem',
      color: 'var(--text-primary)',
      minWidth: 160,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 4 }}>
        <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{data.timeLabel}</span>
        {data.isWarning && (
          <span style={{
            background: 'var(--color-danger-glow)',
            color: 'var(--color-danger)',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: 4,
          }}>
            ⚠ WARNING
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Magnitude:</span>
          <span style={{ fontWeight: 800, color: data.magnitudePct > 45 ? 'var(--color-warning)' : 'var(--color-primary)' }}>
            {data.magnitudePct}%
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Direction:</span>
          <span style={{ fontWeight: 700 }}>{data.direction}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Head Yaw:</span>
          <span>{data.yaw}°</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Head Pitch:</span>
          <span>{data.pitch}°</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Confidence:</span>
          <span>{Math.round((data.confidence || 0.95) * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default function FaceMovementGraph({ history = [], threshold = 45, isCollapsedDefault = false }) {
  const [collapsed, setCollapsed] = useState(isCollapsedDefault);

  const latest = history[history.length - 1] || { magnitudePct: 0, severity: 'NORMAL', direction: 'CENTER' };
  const warningCount = history.filter(h => h.isWarning).length;

  return (
    <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: latest.magnitudePct > threshold ? 'rgba(217,119,6,0.1)' : 'rgba(37,99,235,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={16} color={latest.magnitudePct > threshold ? '#d97706' : '#2563eb'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Real-Time Face Movement
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: latest.magnitudePct > threshold ? '#d97706' : '#22c55e',
                  animation: 'pulse 1.5s ease infinite',
                }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  LIVE (30s)
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Normalized head pose and position tracking window
            </p>
          </div>
        </div>

        {/* Action / Collapsible toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {warningCount > 0 && (
            <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={10} /> {warningCount} warning{warningCount > 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            aria-label={collapsed ? 'Expand Graph' : 'Collapse Graph'}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Main Chart Body */}
      {!collapsed && (
        <div style={{ marginTop: 16 }}>
          {/* Sub-header metric bar */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 120, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>CURRENT MOVEMENT</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: latest.magnitudePct > threshold ? 'var(--color-warning)' : 'var(--color-primary)' }}>
                {latest.magnitudePct}%
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 120, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>DIRECTION</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {latest.direction || 'CENTER'}
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 120, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>HEAD POSE (Y / P / R)</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                {latest.yaw || 0}° / {latest.pitch || 0}° / {latest.roll || 0}°
              </span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div style={{ height: 160, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="movementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="timeLabel" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={threshold}
                  stroke="#d97706"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: 'WARNING THRESHOLD (45%)', fill: '#d97706', fontSize: 9, fontWeight: 700, position: 'insideTopRight' }}
                />
                <Area
                  type="monotone"
                  dataKey="magnitudePct"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#movementGradient)"
                  dot={<WarningDot />}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
