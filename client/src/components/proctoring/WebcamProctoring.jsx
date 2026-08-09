import { useEffect, useRef, useState } from 'react';
import { Camera, Minimize2, Maximize2, AlertTriangle, Shield, Activity, RefreshCw } from 'lucide-react';
import { HeadPositionTracker, DEFAULT_CONFIG } from '../../utils/faceTracker';
import FaceMovementGraph from './FaceMovementGraph';
import { assessmentService } from '../../services/assessmentService';

/**
 * AI Webcam Proctoring Component — Head-Position-Only Detector
 * Technical Specification Compliant (Calibration, Hysteresis, Debounced State Machine, Discrete Events).
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

  const trackerRef = useRef(new HeadPositionTracker(configOverrides));
  const [streamActive, setStreamActive] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  // Real-time telemetry state
  const [telemetry, setTelemetry] = useState({
    state: 'CALIBRATING',
    calibrationProgress: 0,
    isFacePresent: true,
    rawX: 0.5,
    smoothedX: 0.5,
    centerX: 0.5,
    boundaries: { leftTrigger: 0.45, rightTrigger: 0.55 },
    eventCount: 0,
    isWarningActive: false,
    warningDirection: null,
  });

  const [history, setHistory] = useState([]);
  const isAnalyzing = useRef(false);

  // 1. Initialize webcam feed
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
        if (onViolationDetected) {
          onViolationDetected({ type: 'WEBCAM_DISABLED', severity: 'HIGH', message: 'Camera feed disabled or blocked.' });
        }
      }
    }
    if (isActive) startCamera();
    return () => { if (mediaStream) mediaStream.getTracks().forEach(t => t.stop()); };
  }, [isActive]);

  // Recalibrate trigger
  const handleRecalibrate = () => {
    trackerRef.current.reset();
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

          // Process frame with HeadPositionTracker engine
          const result = trackerRef.current.processFrame(ctx, 160, 120);

          setTelemetry({
            state: result.state,
            calibrationProgress: result.calibrationProgress || 100,
            isFacePresent: result.isFacePresent,
            rawX: result.rawX,
            smoothedX: result.smoothedX,
            centerX: result.centerX,
            boundaries: result.boundaries,
            eventCount: result.eventCount,
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

          // Optional: Notify parent if event count reaches excessive thresholds according to policy
          if (result.newFinalizedEvent && onViolationDetected && result.eventCount >= 3) {
            onViolationDetected({
              type: 'SUSTAINED_FACE_DEVIATION',
              severity: 'HIGH',
              message: `Multiple head position deviations recorded (${result.eventCount} events).`
            });
          }
        }
      } catch (_) {
      } finally {
        isAnalyzing.current = false;
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [isActive, streamActive, sessionId]);

  if (!isActive) return null;

  const isCalibrating = telemetry.state === 'CALIBRATING';
  const isWarning = telemetry.isWarningActive;
  const bounds = telemetry.boundaries;

  // Calculate dynamic reticle X position relative to bounds
  const relX = ((telemetry.smoothedX - 0.2) / 0.6) * 100;
  const clampedX = Math.max(10, Math.min(90, relX));

  return (
    <>
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
              background: isCalibrating ? '#f59e0b' : isWarning ? '#dc2626' : '#22c55e',
              animation: 'pulse 1.5s ease infinite',
            }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.05em' }}>
              {isCalibrating ? 'CALIBRATING' : isWarning ? 'WARNING' : 'PROCTORING'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {!isCalibrating && (
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
            <div className={`camera-feed ${isWarning ? 'alert' : ''}`}>
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

                  {/* Head Position Target Overlay */}
                  {!isCalibrating && (
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

                  {/* Calibrating overlay */}
                  {isCalibrating && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.75)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 6, padding: 10, textAlign: 'center',
                    }}>
                      <RefreshCw size={16} color="#f59e0b" style={{ animation: 'spin 1.2s linear infinite' }} />
                      <span style={{ fontSize: '0.68rem', color: '#f8fafc', fontWeight: 700 }}>
                        Sit normally, look at screen
                      </span>
                      <div style={{ width: '80%', height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#f59e0b', width: `${telemetry.calibrationProgress}%`, transition: 'width 0.1s' }} />
                      </div>
                    </div>
                  )}
                </>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Live Warning Status Bar */}
            {!isCalibrating && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>Status</span>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 800,
                    color: isWarning ? '#ef4444' : '#4ade80',
                  }}>
                    {isWarning
                      ? `⚠ Face moved ${telemetry.warningDirection}`
                      : '● Face centered'}
                  </span>
                </div>

                {isWarning && (
                  <p style={{ fontSize: '0.6rem', color: '#fca5a5', marginTop: 3, fontWeight: 500 }}>
                    Please return to calibrated safe zone.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Embedded / Expandable Live Graph */}
      {showGraph && (
        <div style={{
          position: 'fixed', bottom: 20, right: 240, zIndex: 998, width: 460,
        }}>
          <FaceMovementGraph
            history={history}
            boundaries={bounds}
            eventCount={telemetry.eventCount}
          />
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
