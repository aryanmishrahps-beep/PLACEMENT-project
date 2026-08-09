import { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceArea
} from 'recharts';
import { Activity, AlertTriangle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

/* Discrete Event Marker for counted movement events */
const DiscreteEventMarker = (props) => {
  const { cx, cy, payload } = props;
  if (!payload || !payload.isNewEventMarker) return null;
  return (
    <g transform={`translate(${cx},${cy})`}>
      <circle r="8" fill="#dc2626" opacity="0.3" className="animate-pulse" />
      <circle r="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
      <text y="-10" textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="800">
        ⚠
      </text>
    </g>
  );
};

/* Custom Tooltip Content matching Event Schema */
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
      minWidth: 180,
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
            ⚠ {data.eventDirection || 'OUTSIDE'}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Smoothed X:</span>
          <span style={{ fontWeight: 800, fontFamily: 'monospace', color: data.isWarning ? 'var(--color-danger)' : 'var(--color-primary)' }}>
            {data.smoothedX}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Center X:</span>
          <span style={{ fontFamily: 'monospace' }}>{data.centerX}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>State:</span>
          <span style={{ fontWeight: 700 }}>{data.state}</span>
        </div>
        {data.isNewEventMarker && (
          <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px dashed var(--border-subtle)', color: 'var(--color-danger)', fontWeight: 700 }}>
            Discrete Movement Event Logged
          </div>
        )}
      </div>
    </div>
  );
};

export default function FaceMovementGraph({ history = [], boundaries = {}, eventCount = 0, isCollapsedDefault = false }) {
  const [collapsed, setCollapsed] = useState(isCollapsedDefault);

  const latest = history[history.length - 1] || { smoothedX: 0.5, state: 'CENTER' };

  const leftTrigger = boundaries?.leftTrigger ?? 0.45;
  const rightTrigger = boundaries?.rightTrigger ?? 0.55;
  const centerX = boundaries?.centerX ?? 0.5;

  return (
    <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: latest.state !== 'CENTER' && latest.state !== 'CALIBRATING' ? 'rgba(220,38,38,0.1)' : 'rgba(37,99,235,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={16} color={latest.state !== 'CENTER' && latest.state !== 'CALIBRATING' ? '#dc2626' : '#2563eb'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Head Position Tracking
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: latest.state !== 'CENTER' && latest.state !== 'CALIBRATING' ? '#dc2626' : '#22c55e',
                  animation: 'pulse 1.5s ease infinite',
                }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  LIVE
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Head-position-only detector with calibrated safe zone & hysteresis
            </p>
          </div>
        </div>

        {/* Action / Collapsible toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`badge ${eventCount > 0 ? 'badge-warning' : 'badge-success'}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {eventCount > 0 ? <AlertTriangle size={10} /> : <ShieldCheck size={10} />}
            {eventCount} Movement Event{eventCount !== 1 ? 's' : ''}
          </span>
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
          <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 110, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>SMOOTHED X</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: latest.state !== 'CENTER' && latest.state !== 'CALIBRATING' ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                {latest.smoothedX || 0.5}
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 110, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>SAFE ZONE</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                [{leftTrigger.toFixed(2)} - {rightTrigger.toFixed(2)}]
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 110, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>STATE</span>
              <span style={{
                fontSize: '0.85rem', fontWeight: 800,
                color: latest.state === 'CENTER' ? 'var(--color-success)' : latest.state === 'CALIBRATING' ? 'var(--color-warning)' : 'var(--color-danger)'
              }}>
                {latest.state || 'CENTER'}
              </span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div style={{ height: 160, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="posGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                {/* Shaded Safe Zone */}
                <ReferenceArea y1={leftTrigger} y2={rightTrigger} fill="#22c55e" fillOpacity={0.08} />

                {/* Center & Trigger Lines */}
                <ReferenceLine y={centerX} stroke="#64748b" strokeWidth={1} strokeDasharray="2 2" label={{ value: 'CENTER', fill: '#64748b', fontSize: 9 }} />
                <ReferenceLine y={leftTrigger} stroke="#dc2626" strokeDasharray="3 3" strokeWidth={1.2} label={{ value: 'LEFT TRIGGER', fill: '#dc2626', fontSize: 8 }} />
                <ReferenceLine y={rightTrigger} stroke="#dc2626" strokeDasharray="3 3" strokeWidth={1.2} label={{ value: 'RIGHT TRIGGER', fill: '#dc2626', fontSize: 8 }} />

                <XAxis dataKey="timeLabel" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis domain={[0.2, 0.8]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="smoothedX"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#posGradient)"
                  dot={<DiscreteEventMarker />}
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
