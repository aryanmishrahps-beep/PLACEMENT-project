import { useState } from 'react';
import { useLiveStream } from '../../context/LiveStreamContext';

export default function UploadLectureModal({ isOpen, onClose }) {
  const { uploadLecture } = useLiveStream();
  const [form, setForm] = useState({
    title: '',
    subject: 'DSA',
    duration: '45 mins',
    videoUrl: '',
    description: '',
    tags: 'DSA, Algorithms'
  });
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    uploadLecture(form);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card animate-fadeInUp" style={{ width: '100%', maxWidth: 540, background: 'var(--bg-card)' }}>
        <div className="flex justify-between items-center mb-md border-b pb-sm">
          <h3 className="font-bold text-lg flex items-center gap-xs">📹 Upload Lecture / Video</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        {success ? (
          <div className="p-md text-center text-success font-semibold">
            ✅ Lecture uploaded successfully! Added to Student Video Library.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
            <div className="form-group">
              <label className="form-label">Lecture Title</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Masterclass on Graph Shortest Paths"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid grid-2 gap-sm">
              <div className="form-group">
                <label className="form-label">Subject / Topic</label>
                <select
                  className="form-select"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                >
                  <option value="DSA">Data Structures & Algorithms (DSA)</option>
                  <option value="DAA">Design & Analysis of Algorithms (DAA)</option>
                  <option value="DBMS">Database Systems</option>
                  <option value="System Design">System Design</option>
                  <option value="Placement Prep">General Placement Prep</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Duration</label>
                <input
                  className="form-input"
                  placeholder="e.g. 45 mins"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Video Source URL (MP4 or YouTube Embed)</label>
              <input
                className="form-input"
                placeholder="https://www.w3schools.com/html/mov_bbb.mp4 or YouTube URL"
                value={form.videoUrl}
                onChange={e => setForm({ ...form, videoUrl: e.target.value })}
              />
              <span className="text-xs text-secondary mt-xs">Leave blank to use default demo video player URL.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Description & Key Topics Covered</label>
              <textarea
                rows={3}
                className="form-input"
                placeholder="Brief summary of concepts explained in this video..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Search Tags (comma separated)</label>
              <input
                className="form-input"
                placeholder="DSA, Graphs, Dijkstra"
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-sm mt-md">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">🚀 Publish Video Lecture</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
