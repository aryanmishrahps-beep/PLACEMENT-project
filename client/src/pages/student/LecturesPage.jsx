import { useState, useRef, useCallback, useEffect } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useLiveStream } from '../../context/LiveStreamContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/* ─── Firestore helpers (with localStorage fallback) ─────────── */
function progressKey(userId, videoId) {
  return `vp_${userId}_${videoId}`;
}

async function loadProgress(userId, videoId) {
  // Try Firestore first
  try {
    if (db && userId) {
      const ref = doc(db, 'videoProgress', userId, 'videos', videoId);
      const snap = await getDoc(ref);
      if (snap.exists()) return snap.data();
    }
  } catch {/* fall through */}
  // Fallback: localStorage
  try {
    const raw = localStorage.getItem(progressKey(userId || 'guest', videoId));
    if (raw) return JSON.parse(raw);
  } catch {/* ignore */}
  return null;
}

async function saveProgress(userId, videoId, data) {
  // Save to localStorage immediately (always works)
  try {
    localStorage.setItem(progressKey(userId || 'guest', videoId), JSON.stringify(data));
  } catch {/* ignore */}
  // Also try Firestore
  try {
    if (db && userId) {
      const ref = doc(db, 'videoProgress', userId, 'videos', videoId);
      await setDoc(ref, data, { merge: true });
    }
  } catch {/* silent — localStorage already saved */}
}

/* ─── Progress Bar Component ─────────────────────────────────── */
function VideoProgressBar({ percent, completed }) {
  return (
    <div className="video-progress-wrapper">
      <div className="video-progress-track">
        <div
          className="video-progress-fill"
          style={{
            width: `${percent}%`,
            background: completed
              ? 'var(--color-success)'
              : 'var(--color-primary)',
          }}
        />
      </div>
      <span
        className="video-progress-label"
        style={{ color: completed ? 'var(--color-success)' : 'var(--text-secondary)' }}
      >
        {completed ? '✓ Completed' : `${percent}%`}
      </span>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function LecturesPage() {
  const { lectures } = useLiveStream();
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);

  // progress map: { [videoId]: { percent, currentTime, completed } }
  const [progressMap, setProgressMap] = useState({});

  // refs for throttling Firestore writes
  const videoRef = useRef(null);
  const lastSaveTime = useRef(0);
  const saveTimer = useRef(null);

  const userId = user?.id || user?.uid || 'guest';

  /* Load all progress for current lectures on mount */
  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      const entries = await Promise.all(
        lectures.map(async (lec) => {
          const data = await loadProgress(userId, lec.id);
          return [lec.id, data];
        })
      );
      if (!cancelled) {
        const map = {};
        entries.forEach(([id, data]) => { if (data) map[id] = data; });
        setProgressMap(map);
      }
    }
    loadAll();
    return () => { cancelled = true; };
  }, [lectures, userId]);

  /* When opening a video, seek to saved position */
  useEffect(() => {
    if (!activeVideo || !videoRef.current) return;
    const saved = progressMap[activeVideo.id];
    if (saved?.currentTime && !saved.completed) {
      // Small delay so the video element is ready
      const t = setTimeout(() => {
        if (videoRef.current && saved.currentTime) {
          videoRef.current.currentTime = saved.currentTime;
        }
      }, 300);
      return () => clearTimeout(t);
    }
  }, [activeVideo]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Save progress — debounced (max once per 5 s + on pause/end) */
  const persistProgress = useCallback((videoId, percent, currentTime, completed) => {
    const data = { percent, currentTime, completed, updatedAt: Date.now() };
    // Update local state immediately for smooth UI
    setProgressMap(prev => ({ ...prev, [videoId]: data }));

    const now = Date.now();
    if (now - lastSaveTime.current >= 5000 || completed) {
      lastSaveTime.current = now;
      saveProgress(userId, videoId, data);
    } else {
      // Debounce: schedule a write for 5 s later
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        lastSaveTime.current = Date.now();
        saveProgress(userId, videoId, data);
      }, 5000);
    }
  }, [userId]);

  /* Video event handlers */
  const handleTimeUpdate = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || !activeVideo || !vid.duration) return;
    const percent = Math.min(100, Math.round((vid.currentTime / vid.duration) * 100));
    const completed = percent >= 99;
    persistProgress(activeVideo.id, completed ? 100 : percent, vid.currentTime, completed);
  }, [activeVideo, persistProgress]);

  const handleEnded = useCallback(() => {
    if (!activeVideo) return;
    persistProgress(activeVideo.id, 100, videoRef.current?.duration || 0, true);
  }, [activeVideo, persistProgress]);

  const handlePause = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || !activeVideo || !vid.duration) return;
    const percent = Math.min(100, Math.round((vid.currentTime / vid.duration) * 100));
    persistProgress(activeVideo.id, percent, vid.currentTime, percent >= 99);
  }, [activeVideo, persistProgress]);

  /* Close modal */
  const closeVideo = () => {
    handlePause(); // save on close
    clearTimeout(saveTimer.current);
    setActiveVideo(null);
  };

  /* Filtered lectures */
  const filteredLectures = lectures.filter(lec => {
    const matchesSubject = selectedSubject === 'All' || lec.subject === selectedSubject;
    const matchesSearch =
      lec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lec.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const hasActiveSearch = searchQuery.trim() !== '' || selectedSubject !== 'All';

  return (
    <ProtectedLayout title="Video Lectures Library" allowedRoles={['student', 'faculty', 'admin']}>

      {/* Header & Search Bar */}
      <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(16,185,129,0.1) 100%)' }}>
        <div className="flex justify-between items-center flex-wrap gap-md">
          <div>
            <h2 className="text-xl font-bold">📹 Faculty Video Lectures &amp; Masterclasses</h2>
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

      {/* Video Player Modal */}
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
              <button className="btn btn-secondary btn-sm" onClick={closeVideo}>✕ Close</button>
            </div>

            <div style={{ aspectRatio: '16/9', background: '#000' }}>
              <video
                ref={videoRef}
                autoPlay
                controls
                src={activeVideo.videoUrl}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onPause={handlePause}
              />
            </div>

            {/* In-modal progress bar */}
            {(() => {
              const p = progressMap[activeVideo.id];
              const pct = p?.percent || 0;
              const done = p?.completed || false;
              return pct > 0 ? (
                <div style={{ padding: '8px 16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <VideoProgressBar percent={pct} completed={done} />
                </div>
              ) : null;
            })()}

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

      {/* Empty State — no matching videos */}
      {filteredLectures.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center', padding: '64px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 4 }}>🔍</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Not Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 340 }}>
            {searchQuery
              ? <>No videos found matching <strong>"{searchQuery}"</strong>.</>
              : 'No videos match the selected filters.'}
          </p>
          {hasActiveSearch && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 8 }}
              onClick={() => { setSearchQuery(''); setSelectedSubject('All'); }}
            >
              ✕ Clear Search
            </button>
          )}
        </div>
      ) : (
        /* Lectures Grid */
        <div className="grid grid-3">
          {filteredLectures.map(lec => {
            const progress = progressMap[lec.id];
            const pct = progress?.percent || 0;
            const completed = progress?.completed || false;

            return (
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
                    {/* Completed overlay badge */}
                    {completed && (
                      <div style={{
                        position: 'absolute', top: '10px', left: '10px',
                        background: 'var(--color-success)', color: '#fff',
                        padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}>
                        ✓ Completed
                      </div>
                    )}
                    <button
                      onClick={() => setActiveVideo(lec)}
                      style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)', width: '48px', height: '48px',
                        borderRadius: '50%', background: 'var(--color-primary)', border: 'none',
                        color: '#fff', fontSize: '1.2rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      }}
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

                <div className="p-md border-t" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Progress bar — only shown if video has been started */}
                  {pct > 0 && (
                    <VideoProgressBar percent={pct} completed={completed} />
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex gap-xs">
                      {lec.tags?.map((t, idx) => (
                        <span key={idx} className="badge badge-muted text-xs">#{t}</span>
                      ))}
                    </div>
                    <button onClick={() => setActiveVideo(lec)} className="btn btn-primary btn-sm">
                      {pct > 0 && !completed ? '▶ Continue' : completed ? '↺ Rewatch' : '▶ Watch Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ProtectedLayout>
  );
}
