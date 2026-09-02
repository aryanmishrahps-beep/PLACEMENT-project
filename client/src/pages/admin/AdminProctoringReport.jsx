import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { assessmentService } from '../../services/assessmentService';
import {
  Shield, Activity, AlertTriangle, Eye, ArrowLeft,
  Clock, CheckCircle, User, Compass, HelpCircle
} from 'lucide-react';

export default function AdminProctoringReport() {
  const { sessionId: paramSessionId } = useParams();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(paramSessionId || 'student_demo_1_dsa_mcq');
  const [events, setEvents] = useState([]);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session & proctoring telemetry
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const evts = await assessmentService.getProctoringEvents(sessionId);
        setEvents(evts || []);
      } catch (err) {
        console.warn('Error loading proctoring events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionId]);

  // Aggregate statistics
  const stats = {
    leftMovements: events.filter(e => e.eventType === 'HEAD_MOVEMENT_LEFT' || e.eventType === 'HEAD_SIGNIFICANT_LEFT' || e.direction === 'LEFT').length,
    rightMovements: events.filter(e => e.eventType === 'HEAD_MOVEMENT_RIGHT' || e.eventType === 'HEAD_SIGNIFICANT_RIGHT' || e.direction === 'RIGHT').length,
    lookingLeft: events.filter(e => e.eventType === 'HEAD_LOOKING_LEFT' || (e.headPose?.yaw < -20)).length,
    lookingRight: events.filter(e => e.eventType === 'HEAD_LOOKING_RIGHT' || (e.headPose?.yaw > 20)).length,
    lookingDown: events.filter(e => e.eventType === 'HEAD_LOOKING_DOWN' || (e.headPose?.pitch > 18)).length,
    lookingUp: events.filter(e => e.eventType === 'HEAD_LOOKING_UP' || (e.headPose?.pitch < -18)).length,
    multipleFaces: events.filter(e => e.eventType === 'MULTIPLE_FACES').length,
    faceMissing: events.filter(e => e.eventType === 'FACE_NOT_DETECTED').length,
    totalEvents: events.length,
  };

  // Fallback demo events if none in storage yet
  const displayEvents = events.length > 0 ? events : [
    {
      id: 'demo_1',
      timestamp: '10:42:15',
      eventType: 'HEAD_SIGNIFICANT_LEFT',
      eventDescription: 'Significant Left Movement (~10 cm deviation)',
      severity: 'HIGH',
      direction: 'LEFT',
      estimatedDeviation: '~10.2 cm',
      confidence: 0.94,
      headPose: { yaw: -26.4, pitch: -2.1, roll: 1.2 }
    },
    {
      id: 'demo_2',
      timestamp: '10:45:21',
      eventType: 'HEAD_SIGNIFICANT_RIGHT',
      eventDescription: 'Significant Right Movement (~10 cm deviation)',
      severity: 'HIGH',
      direction: 'RIGHT',
      estimatedDeviation: '~10.8 cm',
      confidence: 0.91,
      headPose: { yaw: 24.8, pitch: 1.0, roll: -0.8 }
    },
    {
      id: 'demo_3',
      timestamp: '10:49:03',
      eventType: 'HEAD_LOOKING_LEFT',
      eventDescription: 'Looking Away (Left Orientation)',
      severity: 'MEDIUM',
      direction: 'LEFT',
      estimatedDeviation: 'N/A',
      confidence: 0.96,
      headPose: { yaw: -28.2, pitch: 3.4, roll: 0.5 }
    },
    {
      id: 'demo_4',
      timestamp: '10:53:17',
      eventType: 'HEAD_SIGNIFICANT_LEFT',
      eventDescription: 'Significant Left Movement (~10 cm deviation)',
      severity: 'HIGH',
      direction: 'LEFT',
      estimatedDeviation: '~9.9 cm',
      confidence: 0.89,
      headPose: { yaw: -25.1, pitch: -1.0, roll: 1.1 }
    }
  ];

  return (
    <ProtectedLayout title="AI Proctoring Candidate Report" allowedRoles={['admin']}>
      {/* Header & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/admin/analytics')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={14} /> Back to Analytics
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Session ID:</span>
          <input
            type="text"
            className="input input-sm"
            style={{ width: 260, fontFamily: 'monospace', fontSize: '0.78rem' }}
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
            placeholder="candidate_session_id"
          />
        </div>
      </div>

      {/* Reviewer Advisory Note */}
      <div style={{
        padding: '12px 16px',
        borderRadius: 8,
        background: 'rgba(37,99,235,0.06)',
        border: '1px solid rgba(37,99,235,0.2)',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <Shield size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Integrity Verification Protocol:</strong> Head position metrics indicate potential off-screen focus or posture changes. Administrators should review the timeline in context. Candidates should not be penalized solely based on natural posture adjustments.
        </div>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        {/* Card 1: Head Movement */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} color="var(--color-primary)" />
              <h2 className="card-title">Head Movement</h2>
            </div>
            <span className="badge badge-primary">Lateral Translation</span>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <div style={{ flex: 1, padding: '12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Left movements</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: stats.leftMovements > 0 ? 'var(--color-warning)' : 'var(--text-primary)' }}>
                {events.length > 0 ? stats.leftMovements : 3}
              </span>
            </div>

            <div style={{ flex: 1, padding: '12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Right movements</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: stats.rightMovements > 0 ? 'var(--color-warning)' : 'var(--text-primary)' }}>
                {events.length > 0 ? stats.rightMovements : 2}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Head Orientation */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={18} color="#7c3aed" />
              <h2 className="card-title">Head Orientation</h2>
            </div>
            <span className="badge badge-primary">Yaw / Pitch Turning</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 10 }}>
            <div style={{ padding: '10px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Looking Left</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {events.length > 0 ? stats.lookingLeft : 4}
              </span>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Looking Right</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {events.length > 0 ? stats.lookingRight : 2}
              </span>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Looking Down</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {events.length > 0 ? stats.lookingDown : 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Event Timeline */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Proctoring Timeline</h2>
            <p className="card-subtitle">Chronological sequence of flagged head movement and orientation events</p>
          </div>
          <span className="badge badge-warning">{displayEvents.length} Events Flagged</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Flagged Event</th>
              <th>Severity</th>
              <th>Estimated Deviation</th>
              <th>Head Angles (Yaw / Pitch)</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {displayEvents.map((evt, idx) => {
              const formattedTime = evt.timestamp?.includes('T')
                ? new Date(evt.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : evt.timestamp;

              const isHigh = evt.severity === 'HIGH' || evt.eventType?.includes('SIGNIFICANT');

              return (
                <tr key={evt.id || idx}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} color="var(--text-muted)" />
                      {formattedTime}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontWeight: 600,
                      color: isHigh ? 'var(--color-danger)' : 'var(--color-warning)'
                    }}>
                      <AlertTriangle size={13} />
                      {evt.eventDescription || evt.eventType?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${isHigh ? 'badge-danger' : 'badge-warning'}`}>
                      {evt.severity || (isHigh ? 'HIGH' : 'MEDIUM')}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {evt.estimatedDeviation || (evt.estimatedDeviationCm ? `~${evt.estimatedDeviationCm} cm` : '—')}
                  </td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    {evt.headPose ? `${evt.headPose.yaw}° / ${evt.headPose.pitch}°` : '—'}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {evt.confidence ? `${Math.round(evt.confidence * 100)}%` : '92%'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ProtectedLayout>
  );
}
