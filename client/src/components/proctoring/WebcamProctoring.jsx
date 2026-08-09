import { useEffect, useRef, useState } from 'react';

/**
 * Computer Vision + Browser Event Webcam Proctoring Component
 */
export default function WebcamProctoring({ isActive, onViolationDetected, currentViolations = 0, maxViolations = 3 }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [proctorStatus, setProctorStatus] = useState('NORMAL'); // 'NORMAL' | 'WARNING' | 'ALERT'
  const [statusMessage, setStatusMessage] = useState('Webcam feed active & verified');

  // Cooldown timers & frame counters to prevent spamming duplicate events
  const lastViolationTime = useRef(0);
  const faceMissingCounter = useRef(0);
  const lookingAwayCounter = useRef(0);
  const isAnalyzing = useRef(false);

  // 1. Initialize Webcam Feed
  useEffect(() => {
    let mediaStream = null;

    async function startCamera() {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, frameRate: { ideal: 15 } },
          audio: false
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
        console.warn('Webcam access error:', err.message);
        setPermissionError('Webcam permission required for AI proctoring.');
        // If webcam permission is denied/unavailable, log initial warning
        triggerViolation('WEBCAM_DISABLED', 'HIGH', 'Webcam feed was disabled or blocked.');
      }
    }

    if (isActive) {
      startCamera();
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  // Helper: Trigger Violation with cooldown check (minimum 4s between violations)
  const triggerViolation = (type, severity, message) => {
    const now = Date.now();
    if (now - lastViolationTime.current < 4000) {
      return; // Suppress duplicate events within 4 seconds
    }
    lastViolationTime.current = now;

    setProctorStatus('ALERT');
    setStatusMessage(message);

    if (onViolationDetected) {
      onViolationDetected({ type, severity, message });
    }

    setTimeout(() => {
      setProctorStatus('NORMAL');
      setStatusMessage('Webcam feed active & verified');
    }, 3000);
  };

  // 2. Tab Switch & Window Focus Event Monitoring
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation(
          'TAB_SWITCH_OR_BLUR',
          'HIGH',
          'Tab switch or browser minimize detected!'
        );
      }
    };

    const handleWindowBlur = () => {
      triggerViolation(
        'WINDOW_BLUR',
        'HIGH',
        'Window lost focus (dev tools or secondary window opened)!'
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isActive]);

  // 3. Real-time Computer Vision Frame Analysis (Canvas Pixel Scanning)
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

          const frameData = ctx.getImageData(0, 0, 160, 120).data;

          // Simple luminance & skin-tone bounding box heuristic
          let totalLuminance = 0;
          let skinPixelCount = 0;
          let leftQuadrantPixels = 0;
          let rightQuadrantPixels = 0;
          let centerQuadrantPixels = 0;

          for (let i = 0; i < frameData.length; i += 16) { // sample every 4th pixel
            const r = frameData[i];
            const g = frameData[i + 1];
            const b = frameData[i + 2];

            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            totalLuminance += luminance;

            // Basic skin tone / contrast range detection
            if (r > 60 && g > 40 && b > 20 && r > g && r > b && (Math.max(r, g, b) - Math.min(r, g, b) > 15)) {
              skinPixelCount++;

              const pixelIndex = i / 4;
              const x = pixelIndex % 160;

              if (x < 50) leftQuadrantPixels++;
              else if (x > 110) rightQuadrantPixels++;
              else centerQuadrantPixels++;
            }
          }

          const avgLuminance = totalLuminance / (frameData.length / 16);

          // A) Face Absence Check
          if (skinPixelCount < 40 || avgLuminance < 15) {
            faceMissingCounter.current += 1;
            if (faceMissingCounter.current >= 3) {
              triggerViolation('FACE_NOT_DETECTED', 'HIGH', 'No face detected in webcam feed!');
              faceMissingCounter.current = 0;
            }
          } else {
            faceMissingCounter.current = 0;
          }

          // B) Multiple Faces Check (Excessive skin pixels scattered across entire width)
          if (skinPixelCount > 450 && (leftQuadrantPixels > 100 && rightQuadrantPixels > 100)) {
            triggerViolation('MULTIPLE_FACES_DETECTED', 'HIGH', 'Multiple faces detected in candidate frame!');
          }

          // C) Head Turn / Looking Away Check (Extreme lateral imbalance)
          if (skinPixelCount > 60) {
            const sideRatio = Math.abs(leftQuadrantPixels - rightQuadrantPixels) / (centerQuadrantPixels + 1);
            if (sideRatio > 3.5) {
              lookingAwayCounter.current += 1;
              if (lookingAwayCounter.current >= 4) {
                triggerViolation('LOOKING_AWAY', 'MEDIUM', 'Candidate is looking away from the assessment screen!');
                lookingAwayCounter.current = 0;
              }
            } else {
              lookingAwayCounter.current = 0;
            }
          }
        }
      } catch (err) {
        // Frame analysis fallback
      } finally {
        isAnalyzing.current = false;
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive, streamActive]);

  if (!isActive) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      width: '220px',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: `2px solid ${proctorStatus === 'ALERT' ? 'var(--color-danger, #ef4444)' : 'rgba(59, 130, 246, 0.4)'}`,
      borderRadius: '16px',
      padding: '12px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header Status Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: proctorStatus === 'ALERT' ? '#ef4444' : '#10b981',
            boxShadow: `0 0 8px ${proctorStatus === 'ALERT' ? '#ef4444' : '#10b981'}`,
            animation: 'pulse 1.5s infinite'
          }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.5px', color: '#f8fafc' }}>
            AI PROCTOR
          </span>
        </div>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: '10px',
          background: currentViolations > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
          color: currentViolations > 0 ? '#ef4444' : '#10b981',
          border: `1px solid ${currentViolations > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
        }}>
          Violations: {currentViolations}/{maxViolations}
        </span>
      </div>

      {/* Video Stream Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '130px',
        borderRadius: '10px',
        overflow: 'hidden',
        background: '#020617',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {permissionError ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', padding: '8px', textAlign: 'center',
            color: '#ef4444', fontSize: '0.72rem', fontWeight: 600
          }}>
            <span>📷</span>
            <span>{permissionError}</span>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)' // mirror video feed
              }}
            />
            {/* Target Reticle / Face Box Overlay */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '65%', height: '75%',
              border: `2px dashed ${proctorStatus === 'ALERT' ? '#ef4444' : 'rgba(59, 130, 246, 0.6)'}`,
              borderRadius: '50%',
              pointerEvents: 'none',
              transition: 'border-color 0.2s'
            }} />
          </>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Status Message Footer */}
      <div style={{
        marginTop: '8px',
        fontSize: '0.68rem',
        color: proctorStatus === 'ALERT' ? '#fca5a5' : '#94a3b8',
        fontWeight: 600,
        lineHeight: 1.3,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {statusMessage}
      </div>
    </div>
  );
}
