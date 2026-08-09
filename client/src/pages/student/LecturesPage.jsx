import { useState } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useLiveStream } from '../../context/LiveStreamContext';

export default function LecturesPage() {
  const { lectures } = useLiveStream();
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);

  const filteredLectures = lectures.filter(lec => {
    const matchesSubject = selectedSubject === 'All' || lec.subject === selectedSubject;
    const matchesSearch = lec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lec.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <ProtectedLayout title="Video Lectures Library" allowedRoles={['student', 'faculty', 'admin']}>
      {/* Header & Search Bar */}
      <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(16,185,129,0.1) 100%)' }}>
        <div className="flex justify-between items-center flex-wrap gap-md">
          <div>
            <h2 className="text-xl font-bold">📹 Faculty Video Lectures & Masterclasses</h2>
            <p className="text-secondary text-sm">Watch recorded lectures, subject tutorials, and algorithmic deep dives.</p>
          </div>
          <div className="flex gap-sm items-center flex-wrap">
            <input
              className="form-input"
              style={{ width: 220 }}
              placeholder="Search lectures..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select
              className="form-select"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="All">All Subjects</option>
              <option value="DSA">DSA</option>
              <option value="DAA">DAA</option>
              <option value="System Design">System Design</option>
              <option value="Placement Prep">Placement Prep</option>
            </select>
          </div>
        </div>
      </div>

      {/* Video Player Modal when a video is clicked */}
      {activeVideo && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="card animate-fadeInUp" style={{ width: '100%', maxWidth: 800, background: 'var(--bg-card)', padding: 0, overflow: 'hidden' }}>
            <div className="p-md flex justify-between items-center border-b">
              <div>
                <span className="badge badge-primary">{activeVideo.subject}</span>
                <h3 className="font-bold text-lg mt-xs">{activeVideo.title}</h3>
                <p className="text-xs text-secondary">{activeVideo.faculty} • Published: {activeVideo.date}</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveVideo(null)}>✕ Close</button>
            </div>
            
            <div style={{ aspectRatio: '16/9', background: '#000' }}>
              <video
                autoPlay
                controls
                src={activeVideo.videoUrl}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div className="p-md">
              <h4 className="font-bold text-sm mb-xs">Description:</h4>
              <p className="text-sm text-secondary mb-sm">{activeVideo.description}</p>
              <div className="flex gap-xs flex-wrap">
                {activeVideo.tags?.map((t, idx) => (
                  <span key={idx} className="badge badge-accent text-xs">#{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lectures Grid */}
      <div className="grid grid-3">
        {filteredLectures.map(lec => (
          <div key={lec.id} className="card flex flex-col justify-between" style={{ padding: 0, overflow: 'hidden' }}>
            <div>
              <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: '#111' }}>
                <img
                  src={lec.thumbnail}
                  alt={lec.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                />
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', padding: '2px 8px', borderRadius: '4px', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>
                  ⏱️ {lec.duration}
                </div>
                <button
                  onClick={() => setActiveVideo(lec)}
                  style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-primary)', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                >
                  ▶
                </button>
              </div>

              <div className="p-md">
                <div className="flex justify-between items-center mb-xs">
                  <span className="badge badge-accent text-xs">{lec.subject}</span>
                  <span className="text-xs text-secondary">{lec.date}</span>
                </div>
                <h3 className="font-bold text-md mb-xs">{lec.title}</h3>
                <p className="text-xs text-secondary mb-sm" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {lec.description}
                </p>
                <div className="text-xs text-muted font-semibold">👨‍🏫 {lec.faculty}</div>
              </div>
            </div>

            <div className="p-md border-t flex justify-between items-center">
              <div className="flex gap-xs">
                {lec.tags?.map((t, idx) => (
                  <span key={idx} className="badge badge-muted text-xs">#{t}</span>
                ))}
              </div>
              <button onClick={() => setActiveVideo(lec)} className="btn btn-primary btn-sm">
                ▶ Watch Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </ProtectedLayout>
  );
}
