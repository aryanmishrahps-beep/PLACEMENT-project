import { useState, useEffect, useRef, useCallback } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  WebRTCBroadcaster,
  sendFirebaseMessage,
  subscribeToChat,
  setStreamLive,
  setStreamOffline,
  subscribeToViewerCount,
} from '../../services/webrtcService';

const ROOM_ID = 'classroom-live-1';

export default function FacultyLiveStudioPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Stream state
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [cameraError, setCameraError] = useState('');
  const [streamTitle, setStreamTitle] = useState('Data Structures Live Masterclass');
  const [subject, setSubject] = useState('DSA');

  // Chat
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // WebRTC
  const broadcasterRef = useRef(null);
  const videoRef = useRef(null);

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to Firebase chat + viewer count
  useEffect(() => {
    const unsub1 = subscribeToChat(ROOM_ID, setMessages);
    const unsub2 = subscribeToViewerCount(ROOM_ID, setViewerCount);
    return () => { unsub1(); unsub2(); };
  }, []);

  const startLive = async () => {
    try {
      setCameraError('');
      const broadcaster = new WebRTCBroadcaster(ROOM_ID);
      broadcasterRef.current = broadcaster;

      const stream = await broadcaster.startCamera({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Write stream info to Firebase
      await setStreamLive(ROOM_ID, {
        title: streamTitle,
        subject,
        hostName: user?.name || 'Faculty',
        hostId: user?.id,
      });

      broadcaster.listenForViewers();
      setIsLive(true);

      // Auto welcome message
      await sendFirebaseMessage(ROOM_ID, user?.name || 'Faculty', 'Faculty', '🎙️ Live class has started! Welcome everyone.');
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera/microphone access denied. Please allow permissions in your browser and try again.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera or microphone detected on this device.');
      } else {
        setCameraError(`Could not access camera: ${err.message}`);
      }
    }
  };

  const endLive = async () => {
    if (!window.confirm('Are you sure you want to end this broadcast?')) return;
    broadcasterRef.current?.destroy();
    await setStreamOffline(ROOM_ID);
    setIsLive(false);
    navigate('/faculty/dashboard');
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    broadcasterRef.current?.toggleMute(newMuted);
  };

  const toggleCamera = () => {
    const newOff = !isCameraOff;
    setIsCameraOff(newOff);
    broadcasterRef.current?.toggleCamera(newOff);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        await broadcasterRef.current?.startScreenShare();
        setIsScreenSharing(true);
      } catch (err) {
        if (err.name !== 'NotAllowedError') alert('Screen share failed: ' + err.message);
      }
    } else {
      await broadcasterRef.current?.stopScreenShare();
      setIsScreenSharing(false);
    }
  };

  const sendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    await sendFirebaseMessage(ROOM_ID, user?.name || 'Faculty', 'Faculty', chatInput.trim());
    setChatInput('');
  };

  return (
    <ProtectedLayout title="Faculty Live Broadcast Studio" allowedRoles={['faculty', 'admin']}>

      {/* Pre-Live Setup / Go Live Header */}
      {!isLive ? (
        <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(16,185,129,0.08) 100%)', border: '1px solid var(--border-color)' }}>
          <h2 className="text-xl font-bold mb-md">🎙️ Set Up Your Live Broadcast</h2>
          <div className="grid grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Stream Title</label>
              <input className="form-input" value={streamTitle} onChange={e => setStreamTitle(e.target.value)} placeholder="e.g. Data Structures Live Masterclass" />
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-select" value={subject} onChange={e => setSubject(e.target.value)}>
                <option value="DSA">Data Structures & Algorithms</option>
                <option value="DAA">Design & Analysis of Algorithms</option>
                <option value="OS">Operating Systems</option>
                <option value="DBMS">Database Management</option>
                <option value="CN">Computer Networks</option>
              </select>
            </div>
          </div>
          {cameraError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '16px', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
              ⚠️ {cameraError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={startLive} className="btn btn-primary btn-lg font-bold" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', padding: '12px 32px' }}>
              🔴 Go Live Now
            </button>
            <p className="text-secondary text-sm">Your browser will ask for camera & microphone permission</p>
          </div>
        </div>
      ) : (
        <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(168,85,247,0.1) 100%)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div className="flex justify-between items-center flex-wrap gap-md">
            <div className="flex items-center gap-md">
              <span className="badge" style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
                🔴 LIVE BROADCASTING
              </span>
              <div>
                <h2 className="text-xl font-bold">{streamTitle}</h2>
                <p className="text-secondary text-sm">Host: {user?.name || 'Faculty'} • Subject: {subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <div className="stat-card p-xs" style={{ minWidth: 140, margin: 0, textAlign: 'center' }}>
                <span className="text-xs text-secondary">Live Viewers</span>
                <div className="font-bold text-lg text-primary">👥 {viewerCount} Watching</div>
              </div>
              <button onClick={endLive} className="btn btn-danger btn-lg font-bold">🛑 End Broadcast</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
        {/* Left: Real Camera Video */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card p-0 overflow-hidden" style={{ position: 'relative', background: '#000', borderRadius: '12px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isCameraOff && isLive ? (
              <div style={{ textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: '3rem' }}>📷🚫</div>
                <p style={{ fontWeight: 600, color: '#aaa', marginTop: 8 }}>Camera Paused</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: isLive ? 'block' : 'none' }}
                />
                {!isLive && (
                  <div style={{ textAlign: 'center', color: '#aaa' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 12 }}>📹</div>
                    <p style={{ fontWeight: 600 }}>Camera preview will appear here</p>
                    <p style={{ fontSize: '0.8rem', marginTop: 4 }}>Click "Go Live Now" to start</p>
                  </div>
                )}
              </>
            )}
            {isLive && (
              <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
                <span style={{ background: 'rgba(239,68,68,0.9)', padding: '4px 10px', borderRadius: '20px', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                  🔴 LIVE
                </span>
                {isScreenSharing && (
                  <span style={{ background: 'rgba(99,102,241,0.9)', padding: '4px 10px', borderRadius: '20px', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                    🖥️ SCREEN SHARING
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="card flex justify-between items-center flex-wrap gap-sm">
            <div className="flex gap-sm">
              <button
                className={`btn ${isMuted ? 'btn-danger' : 'btn-secondary'}`}
                onClick={toggleMute}
                disabled={!isLive}
              >
                {isMuted ? '🔇 Unmute Mic' : '🎙️ Mute Mic'}
              </button>
              <button
                className={`btn ${isCameraOff ? 'btn-danger' : 'btn-secondary'}`}
                onClick={toggleCamera}
                disabled={!isLive}
              >
                {isCameraOff ? '📷 Turn On Camera' : '📹 Turn Off Camera'}
              </button>
              <button
                className={`btn ${isScreenSharing ? 'btn-primary' : 'btn-secondary'}`}
                onClick={toggleScreenShare}
                disabled={!isLive}
              >
                {isScreenSharing ? '🛑 Stop Share' : '🖥️ Share Screen'}
              </button>
            </div>
            <div className="text-xs text-secondary font-semibold">
              {isLive
                ? <span className="text-success">● Broadcasting Live • Viewers: {viewerCount}</span>
                : <span className="text-muted">● Offline — Click Go Live to start</span>
              }
            </div>
          </div>
        </div>

        {/* Right: Real-time Firebase Chat */}
        <div className="card flex flex-col" style={{ height: '560px', padding: 0 }}>
          <div className="p-md border-b flex justify-between items-center">
            <h3 className="font-bold text-sm">💬 Live Student Chat</h3>
            <span className="badge badge-accent text-xs" style={{ animation: isLive ? 'pulse 2s infinite' : 'none' }}>
              {isLive ? '● Real-Time' : '○ Offline'}
            </span>
          </div>

          {/* Chat Messages */}
          <div className="p-md flex flex-col gap-sm overflow-y-auto flex-1" style={{ background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
            {messages.length === 0 ? (
              <p className="text-muted text-xs" style={{ textAlign: 'center', marginTop: 20 }}>
                {isLive ? 'Waiting for students to join...' : 'Chat will appear here when you go live.'}
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

          {/* Send Message */}
          <form onSubmit={sendChat} className="p-sm border-t flex gap-xs">
            <input
              className="form-input text-xs"
              placeholder={isLive ? 'Say something to your students...' : 'Go live to chat...'}
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
