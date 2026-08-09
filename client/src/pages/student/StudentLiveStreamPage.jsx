import { useState, useEffect, useRef } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useAuth } from '../../context/AuthContext';
import {
  WebRTCViewer,
  sendFirebaseMessage,
  subscribeToChat,
  subscribeToStream,
  subscribeToViewerCount,
  addViewer,
} from '../../services/webrtcService';

const ROOM_ID = 'classroom-live-1';

export default function StudentLiveStreamPage() {
  const { user } = useAuth();

  const [streamInfo, setStreamInfo] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [reactions, setReactions] = useState({ likes: 0, helpful: 0 });
  const [connectionError, setConnectionError] = useState('');

  const videoRef = useRef(null);
  const viewerRef = useRef(null);
  const chatEndRef = useRef(null);
  const viewerId = useRef(`viewer-${user?.id || Date.now()}`);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to stream presence, chat, and viewer count
  useEffect(() => {
    const unsub1 = subscribeToStream(ROOM_ID, setStreamInfo);
    const unsub2 = subscribeToChat(ROOM_ID, setMessages);
    const unsub3 = subscribeToViewerCount(ROOM_ID, setViewerCount);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const joinStream = async () => {
    if (!streamInfo?.isLive) return;
    setIsConnecting(true);
    setConnectionError('');
    try {
      const viewer = new WebRTCViewer(ROOM_ID, viewerId.current);
      viewerRef.current = viewer;

      // KEY FIX: set up callback BEFORE connecting so ontrack can fire directly into the video element
      viewer.onRemoteStream = (stream) => {
        console.log('Got remote stream, attaching to video element');
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => {
            console.warn('Autoplay blocked, waiting for user interaction:', err);
          });
        }
      };

      await viewer.connect();
      await addViewer(ROOM_ID);
      setIsConnected(true);
    } catch (err) {
      console.error('WebRTC viewer error:', err);
      setConnectionError(err.message || 'Could not connect to the live stream. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const leaveStream = () => {
    viewerRef.current?.destroy();
    setIsConnected(false);
  };

  useEffect(() => {
    return () => viewerRef.current?.destroy();
  }, []);

  const sendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    await sendFirebaseMessage(ROOM_ID, user?.name || 'Student', 'Student', chatInput.trim());
    setChatInput('');
  };

  const isLive = streamInfo?.isLive;

  return (
    <ProtectedLayout title="Live Classroom Stream" allowedRoles={['student', 'faculty', 'admin']}>

      {/* Stream Header */}
      <div className="card mb-lg" style={{
        background: isLive
          ? 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(99,102,241,0.1) 100%)'
          : 'var(--bg-secondary)',
        border: isLive ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border-color)'
      }}>
        <div className="flex justify-between items-center flex-wrap gap-md">
          <div>
            <div className="flex items-center gap-xs mb-xs">
              {isLive ? (
                <span className="badge" style={{ background: '#ef4444', color: '#fff', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
                  🔴 LIVE NOW
                </span>
              ) : (
                <span className="badge badge-secondary">● No Active Stream</span>
              )}
              {streamInfo?.subject && <span className="badge badge-accent">{streamInfo.subject}</span>}
            </div>
            <h2 className="text-xl font-bold">{streamInfo?.title || 'Waiting for faculty to go live...'}</h2>
            {streamInfo?.hostName && <p className="text-secondary text-sm">Instructor: {streamInfo.hostName}</p>}
          </div>
          <div className="flex items-center gap-sm">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setReactions(p => ({ ...p, likes: p.likes + 1 }))}
            >
              👍 {reactions.likes}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setReactions(p => ({ ...p, helpful: p.helpful + 1 }))}
            >
              🎯 {reactions.helpful} Helpful
            </button>
            <div className="stat-card p-xs" style={{ margin: 0, minWidth: 130, textAlign: 'center' }}>
              <div className="font-bold text-md text-primary">👥 {viewerCount} Watching</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
        {/* Left: Video Player */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card p-0 overflow-hidden" style={{ position: 'relative', background: '#000', borderRadius: '12px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!isLive ? (
              <div style={{ textAlign: 'center', color: '#aaa' }}>
                <div style={{ fontSize: '4rem', marginBottom: 12 }}>📡</div>
                <p style={{ fontWeight: 600 }}>Waiting for faculty to start the stream...</p>
                <p style={{ fontSize: '0.8rem', marginTop: 4 }}>You'll be notified when the class goes live</p>
              </div>
            ) : !isConnected ? (
              <div style={{ textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔴</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{streamInfo?.title} is LIVE</h3>
                <p style={{ color: '#aaa', marginBottom: 20, fontSize: '0.9rem' }}>by {streamInfo?.hostName}</p>
                {connectionError && (
                  <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: 16 }}>⚠️ {connectionError}</p>
                )}
                <button
                  onClick={joinStream}
                  className="btn btn-primary btn-lg font-bold"
                  disabled={isConnecting}
                  style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
                >
                  {isConnecting ? '⏳ Connecting...' : '▶️ Join Live Stream'}
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                  <span style={{ background: 'rgba(239,68,68,0.9)', padding: '4px 10px', borderRadius: '20px', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                    🔴 LIVE
                  </span>
                </div>
                <button
                  onClick={leaveStream}
                  style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Leave
                </button>
              </>
            )}
          </div>

          {/* Lecture Info */}
          <div className="card">
            <h3 className="font-bold mb-xs">📚 Lecture Description & Resources</h3>
            <p className="text-secondary text-sm mb-md">
              {streamInfo?.title || 'Live interactive session'} — Ask questions in the live chat for real-time answers from your instructor.
            </p>
            <div className="flex gap-sm">
              <a href="/student/nptel-tests" className="btn btn-primary btn-sm">📝 Attempt NPTEL Practice Test</a>
              <a href="/student/lectures" className="btn btn-secondary btn-sm">📹 View Recorded Lectures</a>
            </div>
          </div>
        </div>

        {/* Right: Real-time Firebase Chat */}
        <div className="card flex flex-col" style={{ height: '560px', padding: 0 }}>
          <div className="p-md border-b flex justify-between items-center">
            <h3 className="font-bold text-sm">💬 Live Class Chat</h3>
            <span className="badge badge-accent text-xs" style={{ animation: isLive ? 'pulse 2s infinite' : 'none' }}>
              {isLive ? '● Real-Time' : '○ Offline'}
            </span>
          </div>

          <div className="p-md flex flex-col gap-sm overflow-y-auto flex-1" style={{ background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
            {messages.length === 0 ? (
              <p className="text-muted text-xs" style={{ textAlign: 'center', marginTop: 20 }}>
                {isLive ? 'Be the first to say hello! 👋' : 'Chat is available when the stream is live.'}
              </p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="p-xs rounded" style={{
                  background: msg.role === 'Faculty' ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)',
                  borderLeft: msg.role === 'Faculty' ? '3px solid var(--color-primary)' : '3px solid var(--color-accent)'
                }}>
                  <div className="flex justify-between text-xs text-secondary mb-xs">
                    <span className="font-bold" style={{ color: msg.role === 'Faculty' ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                      {msg.role === 'Faculty' ? '👨‍🏫 ' : '🎓 '}{msg.sender}
                    </span>
                    <span>{msg.time}</span>
                  </div>
                  <div>{msg.text}</div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={sendChat} className="p-sm border-t flex gap-xs">
            <input
              className="form-input text-xs"
              placeholder={isLive ? 'Ask a question...' : 'Stream is offline'}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={!isLive}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!isLive}>Send</button>
          </form>
        </div>
      </div>
    </ProtectedLayout>
  );
}
