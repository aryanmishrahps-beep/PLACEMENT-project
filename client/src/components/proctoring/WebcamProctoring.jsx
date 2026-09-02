import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Minimize2, Maximize2, AlertTriangle, Shield, Activity, RefreshCw, Terminal } from 'lucide-react';
import { HeadPositionTracker, DEFAULT_CONFIG } from '../../utils/faceTracker';
import { detectFrame, destroyEstimator } from '../../utils/headPoseEstimator';
import FaceMovementGraph from './FaceMovementGraph';
import { assessmentService } from '../../services/assessmentService';

/**
 * AI Webcam Proctoring Component — Advanced Head Position Monitoring
 * Real-time 5-Zone Lateral Tracking & Orientation (Yaw/Pitch/Roll)
 */
export default function WebcamProctoring({
  isActive,
  sessionId,
  onViolationDetected,
  maxViolations = 3,
  configOverrides = {}
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const trackerRef = useRef(new HeadPositionTracker(configOverrides));
  const [streamActive, setStreamActive] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showDebug, setShowDebug] = useState(false); // Toggleable via header terminal icon

  // Real-time telemetry state
  const [telemetry, setTelemetry] = useState({
    faceCount: 1,
    state: 'CALIBRATING',
    previousState: 'CENTER',
    calibrationProgress: 0,
    isFacePresent: true,
    rawX: 0.5,
    smoothedX: 0.5,
    centerX: 0.5,
    boundaries: { leftTrigger: 0.40, rightTrigger: 0.60, threshold: 0.10 },
    headPose: { yaw: 0, pitch: 0, roll: 0 },
    orientationState: 'HEAD_NORMAL',
    estimatedDeviationCm: null,
    estimatedDeviationNorm: 0,
    usingMediaPipe: false,
    sideDuration: 0,
    eventCount: 0,
    lastEvent: 'NONE',
    isWarningActive: false,
    warningDirection: null,
  });

  const [history, setHistory] = useState([]);
  const isAnalyzing = useRef(false);

  // Attach stream to video element
  const attachStream = useCallback((stream) => {
    streamRef.current = stream;
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(() => {});
        setStreamActive(true);
        setPermissionError(null);
      };
    }
  }, []);

  // 1. Initialize webcam feed
  useEffect(() => {
    if (!isActive) return;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15 } },
          audio: false,
        });
        attachStream(stream);
      } catch (err) {
        setPermissionError('Camera access denied.');
        if (onViolationDetected) {
          onViolationDetected({ type: 'WEBCAM_DISABLED', severity: 'HIGH', message: 'Camera feed disabled or blocked.' });
        }
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setStreamActive(false);
      destroyEstimator();
    };
  }, [isActive, attachStream, onViolationDetected]);

  // Re-attach stream if videoRef mounts after stream is ready
  const videoCallbackRef = useCallback((node) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      attachStream(streamRef.current);
    }
  }, [attachStream]);

  // Recalibrate trigger
  const handleRecalibrate = () => {
    trackerRef.current.reset();
  };

  // 2. Real-time Frame Analysis Loop (~100ms interval for 10-15fps tracking)
  useEffect(() => {
    if (!isActive || !streamActive) return;

    const intervalId = setInterval(async () => {
      if (isAnalyzing.current || !videoRef.current || !canvasRef.current) return;
      isAnalyzing.current = true;

      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (video.readyState >= video.HAVE_ENOUGH_DATA) {
          canvas.width = 160;
          canvas.height = 120;
          ctx.drawImage(video, 0, 0, 160, 120);

          // Run MediaPipe Face Landmarker detection (async, non-blocking fallback)
          let headPoseData = null;
          try {
            headPoseData = await detectFrame(video, performance.now());
          } catch (_) {}

          // Process frame with HeadPositionTracker engine
          const result = trackerRef.current.processFrame(ctx, 160, 120, headPoseData);

          setTelemetry({
            faceCount: result.faceCount,
            state: result.state,
            previousState: result.previousState,
            calibrationProgress: result.calibrationProgress || 100,
            isFacePresent: result.isFacePresent,
            rawX: result.rawX,
            smoothedX: result.smoothedX,
            centerX: result.centerX,
            boundaries: result.boundaries,
            headPose: result.headPose,
            orientationState: result.orientationState,
            estimatedDeviationCm: result.estimatedDeviationCm,
            estimatedDeviationNorm: result.estimatedDeviationNorm,
            usingMediaPipe: result.usingMediaPipe,
            sideDuration: result.sideDuration,
            eventCount: result.eventCount,
            lastEvent: result.lastEvent,
            isWarningActive: result.isWarningActive,
            warningDirection: result.warningDirection,
          });

          setHistory([...trackerRef.current.history]);

          // Handle Finalized Discrete Event Persistence to Firestore
          if (result.newFinalizedEvent && sessionId) {
            assessmentService.logProctoringEvent({
              sessionId,
              event: result.newFinalizedEvent
            });
          }

          // Notify parent of the violation to trigger warnings
          if (result.newFinalizedEvent && onViolationDetected) {
            onViolationDetected({
              type: result.newFinalizedEvent.eventType,
              severity: result.newFinalizedEvent.severity || 'HIGH',
              message: result.newFinalizedEvent.reason || `Proctoring violation: ${result.newFinalizedEvent.eventType.replace(/_/g, ' ')}`
            });
          }
        }
      } catch (_) {
      } finally {
        isAnalyzing.current = false;
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [isActive, streamActive, sessionId, onViolationDetected]);

  if (!isActive) return null;

  const isCalibrating = telemetry.state === 'CALIBRATING';
  const isWarning = telemetry.isWarningActive;

  // Calculate dynamic reticle X position relative to bounds
  const relX = ((telemetry.smoothedX - 0.2) / 0.6) * 100;
  const clampedX = Math.max(10, Math.min(90, relX));

  // Head Position Status helper
  const getHeadPositionStatus = () => {
    switch (telemetry.state) {
      case 'CENTER':
        return { label: '✓ Center', color: '#4ade80' };
      case 'SLIGHT_LEFT':
        return { label: '⚠ Slight Left', color: '#f59e0b' };
      case 'SLIGHT_RIGHT':
        return { label: '⚠ Slight Right', color: '#f59e0b' };
      case 'SIGNIFICANT_LEFT':
        return { label: '⚠ Significant Left', color: '#ef4444' };
      case 'SIGNIFICANT_RIGHT':
        return { label: '⚠ Significant Right', color: '#ef4444' };
      case 'CALIBRATING':
        return { label: 'Calibrating...', color: '#f59e0b' };
      default:
        return { label: '✓ Center', color: '#4ade80' };
    }
  };

  const headPosStatus = getHeadPositionStatus();

  // Normalized displacement for movement visualization dot
  const displacement = (telemetry.smoothedX || 0.5) - (telemetry.centerX || 0.5);
  const indicatorDotPct = Math.max(10, Math.min(90, 50 + (displacement / 0.2) * 40));

  return createPortal(
    <>
      {/* Main Camera Widget */}
      <div
        className={`camera-widget ${minimized ? 'minimized' : ''}`}
        style={{
          position: 'fixed',
          bottom: '70px',
          right: '20px',
          zIndex: 99999,
          width: minimized ? 130 : 230,
          background: '#0c1220',
          borderRadius: 14,
          padding: 10,
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
          isolation: 'isolate',
        }}
      >
        {/* Widget Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: permissionError ? '#dc2626' : isCalibrating ? '#f59e0b' : isWarning ? '#dc2626' : '#22c55e',
              animation: 'pulse 1.5s ease infinite',
            }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.05em' }}>
              {permissionError ? 'CAM BLOCKED' : isCalibrating ? 'CALIBRATING' : isWarning ? 'WARNING' : 'PROCTORING'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <button
              onClick={() => setShowDebug(d => !d)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: showDebug ? '#38bdf8' : '#64748b', display: 'flex' }}
              title="Toggle Developer Debug Mode"
            >
              <Terminal size={11} />
            </button>
            {!isCalibrating && !permissionError && (
              <button
                onClick={handleRecalibrate}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
                title="Recalibrate Head Center"
              >
                <RefreshCw size={11} />
              </button>
            )}
            <button
              onClick={() => setShowGraph(g => !g)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: showGraph ? '#60a5fa' : '#64748b', display: 'flex' }}
              title="Toggle Head Position Graph"
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
            <div
              className={`camera-feed ${isWarning ? 'alert' : ''}`}
              style={{ height: 158, position: 'relative', overflow: 'hidden', borderRadius: 10, background: '#020617' }}
            >
              {permissionError ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', height: '100%', gap: 8, padding: 12, textAlign: 'center',
                }}>
                  <Camera size={22} color="#ef4444" />
                  <span style={{ fontSize: '0.65rem', color: '#fca5a5', fontWeight: 600, lineHeight: 1.4 }}>
                    Camera blocked.{'\n'}Please allow camera access.
                  </span>
                </div>
              ) : (
                <>
                  <video
                    ref={videoCallbackRef}
                    muted
                    playsInline
                    autoPlay
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)',
                      display: 'block',
                      background: '#020617',
                    }}
                  />

                  {/* Head Position Target Overlay */}
                  {!isCalibrating && streamActive && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: `${clampedX}%`,
                        transform: 'translate(-50%, -50%)',
                        width: '40%',
                        height: '60%',
                        border: `1.5px ${isWarning ? 'solid #dc2626' : 'dashed rgba(59,130,246,0.6)'}`,
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        transition: 'left 0.1s ease-out',
                        boxShadow: isWarning ? '0 0 12px rgba(220,38,38,0.5)' : 'none',
                      }}
                    />
                  )}

                  {/* Loading / calibrating overlay */}
                  {(isCalibrating || !streamActive) && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: streamActive ? 'rgba(15,23,42,0.75)' : 'rgba(2,6,23,0.95)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 6, padding: 10, textAlign: 'center',
                    }}>
                      <RefreshCw size={16} color="#f59e0b" style={{ animation: 'spin 1.2s linear infinite' }} />
                      <span style={{ fontSize: '0.68rem', color: '#f8fafc', fontWeight: 700 }}>
                        {streamActive ? 'Calibrating Camera...' : 'Starting camera…'}
                      </span>
                      {streamActive && (
                        <>
                          <span style={{ fontSize: '0.60rem', color: '#94a3b8' }}>
                            Sit normally and look at screen
                          </span>
                          <div style={{ width: '80%', height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden', marginTop: 2 }}>
                            <div style={{ height: '100%', background: '#f59e0b', width: `${telemetry.calibrationProgress}%`, transition: 'width 0.1s' }} />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Movement Visualization Bar & Head Position Status */}
            {streamActive && !isCalibrating && (
              <div style={{ marginTop: 8, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                {/* Horizontal Movement Indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.04em' }}>
                  <span>LEFT</span>
                  <span style={{ color: '#94a3b8' }}>CENTER</span>
                  <span>RIGHT</span>
                </div>
                <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, margin: '5px 0' }}>
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: -2,
                    bottom: -2,
                    width: 2,
                    background: '#64748b',
                    transform: 'translateX(-50%)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    left: `${indicatorDotPct}%`,
                    top: '50%',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: isWarning ? '#ef4444' : '#38bdf8',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: isWarning ? '0 0 6px #ef4444' : '0 0 6px #38bdf8',
                    transition: 'left 0.1s ease-out',
                  }} />
                </div>

                {/* Head Position Status Label */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600 }}>HEAD POSITION</span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: headPosStatus.color,
                  }}>
                    {headPosStatus.label}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── DEVELOPER DEBUG OVERLAY PANEL ──────────────────────── */}
        {showDebug && !minimized && (
          <div style={{
            marginTop: 8,
            padding: '8px 10px',
            background: '#030712',
            borderRadius: 8,
            border: '1px solid rgba(56,189,248,0.25)',
            fontFamily: 'monospace',
            fontSize: '0.65rem',
            color: '#f3f4f6',
            lineHeight: 1.5,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', fontWeight: 700, marginBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 2 }}>
              <span>PROCTORING DEBUG</span>
              <span style={{ color: telemetry.usingMediaPipe ? '#4ade80' : '#f59e0b' }}>
                {telemetry.usingMediaPipe ? 'MEDIAPIPE' : 'FALLBACK'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Face Count:</span>
              <span style={{ color: telemetry.faceCount >= 2 ? '#ef4444' : '#4ade80', fontWeight: 700 }}>{telemetry.faceCount}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Head Zone:</span>
              <span style={{ color: telemetry.state !== 'CENTER' ? '#ef4444' : '#60a5fa', fontWeight: 700 }}>{telemetry.state}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Orientation:</span>
              <span style={{ color: telemetry.orientationState !== 'HEAD_NORMAL' ? '#f59e0b' : '#4ade80' }}>
                {telemetry.orientationState?.replace('HEAD_', '') || 'NORMAL'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Yaw / Pitch / Roll:</span>
              <span>{telemetry.headPose?.yaw}° / {telemetry.headPose?.pitch}° / {telemetry.headPose?.roll}°</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Est. Deviation:</span>
              <span>
                {telemetry.estimatedDeviationCm !== null ? `~${telemetry.estimatedDeviationCm} cm` : `${telemetry.estimatedDeviationNorm || 0} norm`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Smoothed X / Center:</span>
              <span>{telemetry.smoothedX} / {telemetry.centerX}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Hold Duration:</span>
              <span style={{ color: telemetry.sideDuration >= 1.5 ? '#ef4444' : '#f59e0b' }}>{telemetry.sideDuration}s</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Warning Count:</span>
              <span style={{ color: telemetry.eventCount >= 3 ? '#ef4444' : '#38bdf8', fontWeight: 700 }}>{telemetry.eventCount}/{maxViolations}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2, paddingTop: 2, borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
              <span style={{ color: '#9ca3af' }}>Last Event:</span>
              <span style={{ color: '#f43f5e', fontWeight: 700 }}>{telemetry.lastEvent}</span>
            </div>
          </div>
        )}
      </div>

      {/* Embedded / Expandable Live Graph */}
      {showGraph && (
        <div style={{
          position: 'fixed', bottom: 20, right: 260, zIndex: 99998, width: 460,
        }}>
          <FaceMovementGraph
            history={history}
            boundaries={telemetry.boundaries}
            eventCount={telemetry.eventCount}
          />
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </>,
    document.body
  );
}
