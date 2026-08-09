import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveStream } from '../../context/LiveStreamContext';

export default function GoLiveModal({ isOpen, onClose }) {
  const { startLiveStream } = useLiveStream();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: 'Data Structures & Algorithms: Live Problem Solving',
    subject: 'DSA & DAA Masterclass',
    streamType: 'webcam', // 'webcam' or 'youtube'
    youtubeUrl: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    startLiveStream({
      title: form.title,
      subject: form.subject,
      hostName: 'Dr. Rajesh Sharma (Faculty)',
      streamType: form.streamType,
      youtubeUrl: form.youtubeUrl
    });
    onClose();
    navigate('/faculty/live-studio');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card animate-fadeInUp" style={{ width: '100%', maxWidth: 500, background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.4)' }}>
        <div className="flex justify-between items-center mb-md border-b pb-sm">
          <h3 className="font-bold text-lg text-danger flex items-center gap-xs">🔴 Start Live Stream Broadcast</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
          <div className="form-group">
            <label className="form-label">Live Stream Title</label>
            <input
              className="form-input"
              required
              placeholder="e.g. Masterclass: Dynamic Programming & Graph Algorithms"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Course / Topic</label>
            <input
              className="form-input"
              required
              placeholder="e.g. DSA & DAA Masterclass"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Stream Video Source</label>
            <select
              className="form-select"
              value={form.streamType}
              onChange={e => setForm({ ...form, streamType: e.target.value })}
            >
              <option value="webcam">🎥 Live Laptop Camera & Screen Share</option>
              <option value="youtube">🌐 Embedded YouTube Live Stream ID / URL</option>
            </select>
          </div>

          {form.streamType === 'youtube' && (
            <div className="form-group">
              <label className="form-label">YouTube Live Embed URL</label>
              <input
                className="form-input"
                placeholder="https://www.youtube.com/embed/..."
                value={form.youtubeUrl}
                onChange={e => setForm({ ...form, youtubeUrl: e.target.value })}
              />
            </div>
          )}

          <div className="p-sm rounded mb-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
            📡 Once you click Start, all active students will receive a <strong>"🔴 LIVE NOW"</strong> notification banner on their dashboard to join your live classroom.
          </div>

          <div className="flex justify-end gap-sm mt-sm">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
              🔴 Launch Broadcast Studio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
