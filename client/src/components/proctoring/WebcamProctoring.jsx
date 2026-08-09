import { useEffect, useRef, useState } from 'react';
import { Camera, Minimize2, Maximize2, AlertTriangle, Shield, Activity } from 'lucide-react';
import { FaceTracker, CONFIG } from '../../utils/faceTracker';
import FaceMovementGraph from './FaceMovementGraph';
import { assessmentService } from '../../services/assessmentService';

/**
 * AI Webcam Proctoring Component with Smooth Real-Time Face Movement Detection
 */
export default function WebcamProctoring({
  isActive,
  sessionId,
  onViolationDetected,
  currentViolations = 0,
  maxViolations = 3,
  showGraphInWidget = true
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const trackerRef = useRef(new FaceTracker());
  const [streamActive, setStreamActive] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  // Real-time states
  const [telemetry, setTelemetry] = useState({
    magnitudePct: 0,
    severity: 'NORMAL',
    direction: 'CENTER',
    normX: 0.5,
    normY: 0.5,
    yaw: 0,
    pitch: 0,
    roll: 0,
    isFacePresent: true,
  });

  const [history, setHistory] = useState([]);
  const [instantWarning, setInstantWarning] = useState(null);

  const isAnalyzing = useRef(false);
  const consecutiveViolations = useRef(0);

  // 1. Initialize camera
  useEffect(() => {
    let mediaStream = null;
    async function startCamera() {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, frameRate: { ideal: 15 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setStreamActive(true);
            setPermissionError(null);
          };
        }
      } catch (err) {
        setPermissionError('Camera access required.');
        triggerViolation('WEBCAM_DISABLED', 'HIGH', 'Camera feed was disabled or blocked.');
      }
    }
    if (isActive) startCamera();
    return () => { if (mediaStream) mediaStream.getTracks().forEach(t => t.stop()); };
  }, [isActive]);

  const triggerViolation = (type, severity, message) => {
    if (onViolationDetected) onViolationDetected({ type, severity, message });
  };

  // 2. Real-time Frame Analysis Loop (~100ms interval for smooth 10fps tracking)
  useEffect(() => {
    if (!isActive || !streamActive) return;

    const intervalId = setInterval(() => {
      if (isAnalyzing.current || !videoRef.current || !canvasRef.current) return;
      isAnalyzing.current = true;

      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = 160;
          canvas.height = 120;
          ctx.drawImage(video, 0, 0, 160, 120);

          // Process frame with FaceTracker engine
          const result = trackerRef.current.processFrame(ctx, 160, 120);

          setTelemetry({
            magnitudePct: result.magnitudePct,
            severity: result.severity,
            direction: result.direction,
            normX: result.normX,
            normY: result.normY,
            yaw: result.yaw,
            pitch: result.pitch,
            roll: result.roll,
            isFacePresent: result.isFacePresent,
          });

          setHistory([...trackerRef.current.history]);

          // Handle Instant UI Warning
          if (result.shouldTriggerWarning) {
            const warningMsg = result.direction !== 'CENTER'
              ? `Face deviation (${result.direction}). Please look straight at screen.`
              : `Excessive movement detected (${result.magnitudePct}%).`;

            setInstantWarning(warningMsg);
            setTimeout(() => setInstantWarning(null), 3000);

            // Log Firebase Metadata Event asynchronously
            if (sessionId) {
              assessmentService.recordViolation({
                sessionId,
                type: 'FACE_MOVEMENT',
                severity: result.magnitudePct > 70 ? 'HIGH' : 'MEDIUM',
                message: warningMsg,
                metadata: {
                  direction: result.direction,
                  magnitude: result.magnitudePct / 100,
                  yaw: result.yaw,
                  pitch: result.pitch,
                  confidence: result.confidence,
                }
              });
            }
          }

          // Strict violation check: Only trigger actual session warning if sustained (e.g. 4 consecutive checks)
          if (result.magnitudePct > 65 || !result.isFacePresent) {
            consecutiveViolations.current += 1;
            if (consecutiveViolations.current >= 4) {
              triggerViolation(
                result.isFacePresent ? 'FACE_DEVIATION' : 'FACE_NOT_DETECTED',
                'HIGH',
                result.isFacePresent ? 'Sustained face deviation from screen.' : 'Face missing from camera view.'
              );
              consecutiveViolations.current = 0;
            }
          } else {
            consecutiveViolations.current = 0;
          }
        }
      } catch (_) {
      } finally {
        isAnalyzing.current = false;
      }
    }, 120);

    return () => clearInterval(intervalId);
  }, [isActive, streamActive, sessionId]);

  if (!isActive) return null;

  const isAlert = !!instantWarning || telemetry.magnitudePct > 45;
  const reticleX = (telemetry.normX * 100).toFixed(1);
  const reticleY = (telemetry.normY * 100).toFixed(1);

  return (
    <>
      {/* Instant Warning Banner Toast */}
      {instantWarning && (
        <div style={{
          position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10000, background: '#ffffff', color: '#92400e',
          border: '1.5px solid rgba(217,119,6,0.4)', borderRadius: 999,
          padding: '10px 20px', boxShadow: '0 8px 24px rgba(217,119,6,0.25)',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.855rem', fontWeight: 700,
          animation: 'toastIn 0.2s ease',
        }}>
          <AlertTriangle size={16} color="#d97706" />
          <span>⚠ {instantWarning}</span>
        </div>
      )}

      {/* Main Camera Widget */}
      <div
        className={`camera-widget ${minimized ? 'minimized' : ''}`}
        style={{ width: minimized ? 120 : 210 }}
      >
        {/* Widget Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: isAlert ? '#d97706' : '#22c55e',
              animation: 'pulse 1.5s ease infinite',
            }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.05em' }}>
              {isAlert ? 'MOVEMENT' : 'PROCTORING'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setShowGraph(g => !g)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: showGraph ? '#60a5fa' : '#64748b', display: 'flex' }}
              title="Toggle Live Movement Graph"
            >
              <Activity size={12} />
            </button>
            <button
              onClick={() => setMinimized(m => !m)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
              aria-label={minimized ? 'Expand' : 'Minimize'}
            >
              {minimized ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
            </button>
          </div>
        </div>

        {/* Video feed & Reticle Guide */}
        {!minimized && (
          <>
            <div className={`camera-feed ${isAlert ? 'alert' : ''}`}>
              {permissionError ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', height: 120, gap: 6, padding: 12, textAlign: 'center',
                }}>
                  <Camera size={18} color="#ef4444" />
                  <span style={{ fontSize: '0.65rem', color: '#fca5a5', fontWeight: 600 }}>
                    Camera required
                  </span>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                  />

                  {/* Face Center Target Guide */}
                  <div
                    style={{
                      position: 'absolute',
                      top: `${reticleY}%`,
                      left: `${reticleX}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '45%',
                      height: '60%',
                      border: `1.5px ${isAlert ? 'solid #d97706' : 'dashed rgba(59,130,246,0.6)'}`,
                      borderRadius: '50%',
                      pointerEvents: 'none',
                      transition: 'all 0.12s ease-out',
                      boxShadow: isAlert ? '0 0 12px rgba(217,119,6,0.4)' : 'none',
                    }}
                  />
                  {/* Ideal center crosshair */}
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', pointerEvents: 'none',
                  }} />
                </>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Real-Time Live Status Bar */}
            <div style={{ marginTop: 8 }}>
              {/* Position indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Face Position</span>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700,
                  color: telemetry.direction === 'CENTER' ? '#4ade80' : '#f59e0b',
                }}>
                  {telemetry.direction === 'CENTER' ? '● Centered' : `⚠ Move ${telemetry.direction}`}
                </span>
              </div>

              {/* Movement magnitude bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    width: `${telemetry.magnitudePct}%`,
                    background: telemetry.magnitudePct > 70 ? '#ef4444' : telemetry.magnitudePct > 40 ? '#f59e0b' : '#3b82f6',
                    transition: 'width 0.15s ease-out',
                  }} />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f1f5f9', minWidth: 28, textAlign: 'right' }}>
                  {telemetry.magnitudePct}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Embedded / Expandable Live Graph */}
      {showGraph && (
        <div style={{
          position: 'fixed', bottom: 20, right: 240, zIndex: 998, width: 440,
        }}>
          <FaceMovementGraph history={history} threshold={45} />
        </div>
      )}
    </>
  );
}
