import React from 'react';
import {
  X, Trophy, Flame, Award, BookOpen, FileText, CheckCircle2,
  AlertTriangle, Shield, Clock, Code2, BarChart3, Mail, User, GraduationCap
} from 'lucide-react';

export default function StudentDetailPanel({ student, onClose }) {
  if (!student) return null;

  // Mock extended data if not present on student object
  const completedAssessments = student.assessmentsCount || [
    { title: 'DSA Fundamentals MCQ', score: 92, date: '2026-08-20', status: 'pass' },
    { title: 'DBMS Comprehensive Test', score: 85, date: '2026-08-15', status: 'pass' },
    { title: 'Full Mock Placement Test', score: 78, date: '2026-08-10', status: 'pass' },
    { title: 'Aptitude Reasoning Test', score: 88, date: '2026-08-05', status: 'pass' },
  ];

  const videoProgress = student.videoWatchList || [
    { title: 'Complete Guide to Dynamic Programming & Memoization', percent: 100, completed: true },
    { title: 'Advanced Graph Theory: Tarjan & Kosaraju', percent: 65, completed: false },
    { title: 'Mastering System Design & Distributed Systems', percent: 40, completed: false },
  ];

  const codingStats = student.codingStats || {
    solvedCount: 14,
    totalProblems: 20,
    languages: ['Python', 'JavaScript', 'C++'],
    acceptanceRate: '87.5%',
  };

  const proctoringLogs = student.proctoringEvents || [
    { type: 'Side Head Turn', timestamp: '2026-08-20 10:14 AM', severity: 'low' },
    { type: 'No Warning - Clean Session', timestamp: '2026-08-15 02:30 PM', severity: 'clean' },
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 1100,
      display: 'flex',
      justifyContent: 'flex-end',
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
    }}>
      <div className="animate-slideInRight" style={{
        width: '100%',
        maxWidth: '520px',
        height: '100%',
        background: 'var(--bg-card, #ffffff)',
        borderLeft: '1px solid var(--border-default, rgba(0,0,0,0.1))',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        {/* Panel Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-elevated, #f8fafc)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-xs)',
            }}>
              {student.name ? student.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'ST'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                {student.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>{student.email || `${student.name?.toLowerCase().replace(/\s+/g, '.')}@university.edu`}</span>
              </div>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ borderRadius: '50%', width: 34, height: 34, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Close Panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Panel Body Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Info Badges */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <GraduationCap size={12} /> {student.department || 'CSE'} Department
            </span>
            <span className="badge badge-accent" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              Batch {student.batch || '2025'}
            </span>
            {student.rank && (
              <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Trophy size={12} /> Rank #{student.rank}
              </span>
            )}
          </div>

          {/* Stats Overview Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}>
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 10px',
              textAlign: 'center',
            }}>
              <div style={{ color: 'var(--color-primary-light)', fontSize: '1.2rem', fontWeight: 800 }}>
                ⭐ {student.skill_points || student.skillPoints || 2840}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
                Skill Points
              </div>
            </div>

            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 10px',
              textAlign: 'center',
            }}>
              <div style={{ color: 'var(--color-warning)', fontSize: '1.2rem', fontWeight: 800 }}>
                🔥 {student.streak || 5} days
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
                Streak
              </div>
            </div>

            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 10px',
              textAlign: 'center',
            }}>
              <div style={{ color: 'var(--color-success)', fontSize: '1.2rem', fontWeight: 800 }}>
                {codingStats.solvedCount}/{codingStats.totalProblems}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
                Problems Solved
              </div>
            </div>
          </div>

          {/* Assessment Performance Section */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={16} color="var(--color-primary)" /> Assessment History
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {completedAssessments.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.title}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: item.score >= 80 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {item.score}%
                    </span>
                    <CheckCircle2 size={16} color={item.score >= 80 ? 'var(--color-success)' : 'var(--color-warning)'} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Lecture Progress Section */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={16} color="var(--color-accent)" /> Lecture Progress
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {videoProgress.map((v, idx) => (
                <div key={idx} style={{
                  padding: '12px 14px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {v.title}
                    </span>
                    <span style={{ color: v.completed ? 'var(--color-success)' : 'var(--text-secondary)', marginLeft: 8, fontWeight: 700 }}>
                      {v.completed ? '✓ 100%' : `${v.percent}%`}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${v.percent}%`,
                      background: v.completed ? 'var(--color-success)' : 'var(--color-primary)',
                      borderRadius: 99,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proctoring & Integrity Log */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={16} color="var(--color-warning)" /> AI Proctoring Integrity Status
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {proctoringLogs.map((log, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: log.severity === 'clean' ? 'rgba(22,163,74,0.06)' : 'rgba(217,119,6,0.06)',
                  border: `1px solid ${log.severity === 'clean' ? 'rgba(22,163,74,0.2)' : 'rgba(217,119,6,0.2)'}`,
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {log.severity === 'clean' ? (
                      <CheckCircle2 size={16} color="var(--color-success)" />
                    ) : (
                      <AlertTriangle size={16} color="var(--color-warning)" />
                    )}
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{log.type}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.timestamp}</div>
                    </div>
                  </div>
                  <span className={`badge ${log.severity === 'clean' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                    {log.severity === 'clean' ? 'Verified Clean' : 'Flagged Warning'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Panel Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
          textAlign: 'right',
        }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
