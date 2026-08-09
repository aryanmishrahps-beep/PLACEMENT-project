import { useState } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';

export default function AdminSettings() {
  const [general, setGeneral] = useState({ portalName: 'PlacePrep', contactEmail: 'admin@placeprep.edu', maxStudentsPerBatch: 120, maintenanceMode: false });
  const [security, setSecurity] = useState({ passwordMinLength: 6, sessionTimeout: 24, allowGoogleAuth: false, requireEmailVerification: false });
  const [saved, setSaved] = useState(null);

  const save = (section) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 2500);
  };

  const Field = ({ label, sub, children }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );

  const Toggle = ({ val, onChange }) => (
    <div onClick={onChange} style={{ width: 48, height: 26, borderRadius: 13, background: val ? '#6366f1' : 'rgba(255,255,255,0.12)', cursor: 'pointer', position: 'relative', transition: 'background 0.3s ease', flexShrink: 0 }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: val ? 25 : 3, transition: 'left 0.3s ease' }} />
    </div>
  );

  return (
    <ProtectedLayout title="System Settings" allowedRoles={['admin']}>
      {saved && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 999, background: '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          ✅ {saved} settings saved!
        </div>
      )}

      <div style={{ display: 'grid', gap: 24 }}>
        {/* General */}
        <div className="card">
          <h3 className="font-bold mb-sm" style={{ fontSize: '1rem' }}>🌐 General Settings</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>Basic portal configuration</p>

          <Field label="Portal Name" sub="Name shown in the sidebar and browser tab">
            <input className="form-input" style={{ width: 220 }} value={general.portalName} onChange={e => setGeneral(p => ({ ...p, portalName: e.target.value }))} />
          </Field>
          <Field label="Admin Contact Email" sub="Receives system alerts and user reports">
            <input className="form-input" style={{ width: 220 }} value={general.contactEmail} onChange={e => setGeneral(p => ({ ...p, contactEmail: e.target.value }))} />
          </Field>
          <Field label="Max Students per Batch" sub="Used for capacity planning">
            <input className="form-input" type="number" style={{ width: 100 }} value={general.maxStudentsPerBatch} onChange={e => setGeneral(p => ({ ...p, maxStudentsPerBatch: e.target.value }))} />
          </Field>
          <Field label="Maintenance Mode" sub="When enabled, only admins can log in">
            <Toggle val={general.maintenanceMode} onChange={() => setGeneral(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))} />
          </Field>

          <button className="btn btn-primary btn-sm" style={{ marginTop: 20 }} onClick={() => save('General')}>💾 Save General Settings</button>
        </div>

        {/* Security */}
        <div className="card">
          <h3 className="font-bold mb-sm" style={{ fontSize: '1rem' }}>🔒 Security Settings</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>Authentication and access control</p>

          <Field label="Minimum Password Length" sub="Enforce stronger passwords">
            <input className="form-input" type="number" style={{ width: 100 }} value={security.passwordMinLength} onChange={e => setSecurity(p => ({ ...p, passwordMinLength: e.target.value }))} />
          </Field>
          <Field label="Session Timeout (hours)" sub="Auto-logout after inactivity">
            <input className="form-input" type="number" style={{ width: 100 }} value={security.sessionTimeout} onChange={e => setSecurity(p => ({ ...p, sessionTimeout: e.target.value }))} />
          </Field>
          <Field label="Allow Google Sign-In" sub="Students can sign up via Google OAuth">
            <Toggle val={security.allowGoogleAuth} onChange={() => setSecurity(p => ({ ...p, allowGoogleAuth: !p.allowGoogleAuth }))} />
          </Field>
          <Field label="Require Email Verification" sub="Users must verify email before accessing content">
            <Toggle val={security.requireEmailVerification} onChange={() => setSecurity(p => ({ ...p, requireEmailVerification: !p.requireEmailVerification }))} />
          </Field>

          <button className="btn btn-primary btn-sm" style={{ marginTop: 20 }} onClick={() => save('Security')}>💾 Save Security Settings</button>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <h3 className="font-bold mb-sm" style={{ fontSize: '1rem', color: '#ef4444' }}>⚠️ Danger Zone</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>These actions are irreversible. Proceed with caution.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid #ef444455' }}
              onClick={() => { if (window.confirm('Clear all quiz attempts? This cannot be undone.')) alert('Cleared quiz attempt history.'); }}>
              🗑️ Clear All Quiz Attempts
            </button>
            <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid #ef444455' }}
              onClick={() => { if (window.confirm('Reset all student skill points to 0?')) alert('Skill points reset.'); }}>
              🔄 Reset Skill Points
            </button>
            <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid #ef444455' }}
              onClick={() => { if (window.confirm('Purge all inactive (suspended) accounts?')) alert('Suspended accounts purged.'); }}>
              🔥 Purge Inactive Accounts
            </button>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
