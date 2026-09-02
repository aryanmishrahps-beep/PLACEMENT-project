/**
 * Head Position & Face Detection Engine
 *
 * Upgraded to support:
 * - 5-zone lateral state machine: CENTER | SLIGHT_LEFT | SIGNIFICANT_LEFT | SLIGHT_RIGHT | SIGNIFICANT_RIGHT
 * - Head orientation classification: HEAD_NORMAL | HEAD_LOOKING_LEFT | HEAD_LOOKING_RIGHT | HEAD_LOOKING_UP | HEAD_LOOKING_DOWN
 * - Calibration-based cm-equivalent deviation estimation
 * - MediaPipe landmark integration (headPoseData passed in from WebcamProctoring)
 * - Falls back to skin-pixel centroid when MediaPipe is not yet ready
 * - Configurable HEAD_MOVEMENT_THRESHOLD_CM = 10
 * - Dead zone / smoothing to prevent false positives from natural movements
 * - 1.5s hold-before-event requirement for lateral events
 * - 5s cooldown between repeated same-type events
 * - Existing MULTIPLE_FACES & FACE_NOT_DETECTED events preserved
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export const DEFAULT_CONFIG = {
  // ── Lateral movement thresholds ──────────────────────────────────────────
  HEAD_MOVEMENT_THRESHOLD_CM: 10,    // 10 cm threshold: 0 to 10 cm is SAFE ZONE (no warning). > 10 cm triggers warning.

  // Normalized displacement fractions (fallback when face distance cannot be estimated)
  slightFraction: 0.08,           // Within 10 cm safe zone
  significantFraction: 0.16,      // Beyond 10 cm threshold

  // ── Head orientation thresholds ──────────────────────────────────────────
  yawThresholdDeg: 25,            // Degrees before "Looking Left/Right"
  pitchUpThresholdDeg: -18,       // Negative pitch = looking up (MP convention)
  pitchDownThresholdDeg: 20,      // Positive pitch = looking down

  // ── Smoothing ─────────────────────────────────────────────────────────────
  smoothingAlpha: 0.25,           // EMA alpha (lower = smoother but slower)
  yawSmoothingAlpha: 0.2,         // Separate smoother for orientation angles
  pitchSmoothingAlpha: 0.2,

  // ── Timing ────────────────────────────────────────────────────────────────
  calibrationWindowMs: 3000,      // 3-second calibration
  stabilityMs: 300,               // Must stay in new zone 300ms before considering
  continuousDurationMs: 1500,     // Must remain outside 10cm zone for 1.5s before warning event
  cooldownMs: 5000,               // 5s cooldown between same-type repeated events
  faceMissingThresholdMs: 5000,   // 5s before FACE_NOT_DETECTED event

  // ── Skin-pixel fallback (legacy) ──────────────────────────────────────────
  hysteresisMargin: 0.01,
};

// ---------------------------------------------------------------------------
// Zone Helpers
// ---------------------------------------------------------------------------

/** Classify normalized horizontal displacement into a 5-zone label */
function classifyLateralZone(displacement, slightFraction, significantFraction) {
  if (displacement < -significantFraction) return 'SIGNIFICANT_LEFT';
  if (displacement < -slightFraction)      return 'SLIGHT_LEFT';
  if (displacement > significantFraction)  return 'SIGNIFICANT_RIGHT';
  if (displacement > slightFraction)       return 'SLIGHT_RIGHT';
  return 'CENTER';
}

/** Severity from zone label */
function zoneSeverity(zone) {
  if (zone === 'SIGNIFICANT_LEFT' || zone === 'SIGNIFICANT_RIGHT') return 'HIGH';
  return 'LOW';
}

/** Event type from zone label - ONLY trigger events for > 10cm significant movements */
function zoneToEventType(zone) {
  const map = {
    SIGNIFICANT_LEFT:  'HEAD_SIGNIFICANT_LEFT',
    SIGNIFICANT_RIGHT: 'HEAD_SIGNIFICANT_RIGHT',
  };
  return map[zone] || null;
}

/** Whether a zone is beyond the 10cm limit (triggers warning) */
function isSignificantOffCenter(zone) {
  return zone === 'SIGNIFICANT_LEFT' || zone === 'SIGNIFICANT_RIGHT';
}

// ---------------------------------------------------------------------------
// HeadPositionTracker
// ---------------------------------------------------------------------------

export class HeadPositionTracker {
  constructor(customConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
    this.reset();
  }

  reset() {
    // ── Core state ───────────────────────────────────────────────────────
    this.state = 'CALIBRATING';         // 5-zone + 'CALIBRATING'
    this.previousState = 'CENTER';
    this.orientationState = 'HEAD_NORMAL'; // HEAD_NORMAL | HEAD_LOOKING_LEFT | ...
    this.previousOrientationState = 'HEAD_NORMAL';

    // ── Position tracking ────────────────────────────────────────────────
    this.centerX = 0.5;                 // Calibrated neutral X
    this.centerY = 0.5;
    this.smoothedX = 0.5;
    this.smoothedY = 0.5;
    this.smoothedYaw = 0;
    this.smoothedPitch = 0;
    this.smoothedRoll = 0;
    this.faceWidthNorm = 0;             // Inter-eye distance (MediaPipe)

    // ── Calibration ──────────────────────────────────────────────────────
    this.calibrationStartTime = null;
    this.calibrationSamples = [];       // X position samples
    this.calibrationFaceWidths = [];    // Face width samples for cm estimation

    // ── Stabilization (prevents flicker) ─────────────────────────────────
    this.transitionCandidate = null;
    this.transitionStartTime = 0;
    this.orientationCandidate = null;
    this.orientationCandidateStartTime = 0;

    // ── Duration tracking ────────────────────────────────────────────────
    this.currentZoneStartTime = Date.now();
    this.offCenterWarningTriggered = false; // 1.5s threshold event fired?

    // ── Orientation duration ─────────────────────────────────────────────
    this.orientationZoneStartTime = Date.now();
    this.orientationWarningTriggered = false;

    // ── Face missing ──────────────────────────────────────────────────────
    this.faceMissingStartTime = null;
    this.faceMissingWarningTriggered = false;

    // ── Multiple faces ────────────────────────────────────────────────────
    this.multipleFaceWarningTriggered = false;

    // ── Cooldown tracking (per event type) ───────────────────────────────
    this.lastEventTimeByType = {};
    this.lastWarningTime = 0;

    // ── Logs & telemetry ─────────────────────────────────────────────────
    this.eventCount = 0;
    this.lastEvent = 'NONE';
    this.finalizedEvents = [];
    this.history = [];
    this.maxHistoryLength = 80;

    // ── Source tracking ───────────────────────────────────────────────────
    this.usingMediaPipe = false;        // true when MP landmarks available
    this.calibrationAverageFaceWidth = 0;
  }

  /** EMA smoothing helper */
  smooth(current, previous, alpha) {
    return alpha * current + (1 - alpha) * previous;
  }

  /** Compute current boundaries from config + calibrated center */
  getBoundaries() {
    let { slightFraction, significantFraction } = this.config;
    if (this.faceWidthNorm > 0.05) {
      const INTER_EYE_CM = 6.3;
      const cmPerNorm = INTER_EYE_CM / this.faceWidthNorm;
      significantFraction = this.config.HEAD_MOVEMENT_THRESHOLD_CM / cmPerNorm;
      slightFraction = (this.config.HEAD_MOVEMENT_THRESHOLD_CM * 0.5) / cmPerNorm;
    }
    return {
      centerX: this.centerX,
      slightLeftTrigger:        this.centerX - slightFraction,
      slightRightTrigger:       this.centerX + slightFraction,
      significantLeftTrigger:   this.centerX - significantFraction,
      significantRightTrigger:  this.centerX + significantFraction,
      // 10cm trigger bounds
      leftTrigger:  this.centerX - significantFraction,
      rightTrigger: this.centerX + significantFraction,
      threshold:    significantFraction,
    };
  }

  /** Check cooldown for a specific event type */
  isOnCooldown(eventType) {
    const now = Date.now();
    const last = this.lastEventTimeByType[eventType] || 0;
    return (now - last) < this.config.cooldownMs;
  }

  /** Record event time for cooldown tracking */
  markEventTime(eventType) {
    this.lastEventTimeByType[eventType] = Date.now();
    this.lastWarningTime = Date.now();
  }

  /** Build a finalized event object */
  buildEvent(eventType, extra = {}) {
    const now = Date.now();
    const displacement = Math.abs(this.smoothedX - this.centerX);

    // Estimate cm deviation using face width if available
    let estimatedDeviationCm = null;
    const INTER_EYE_CM = 6.3;
    if (this.faceWidthNorm > 0.05) {
      const cmPerNorm = INTER_EYE_CM / this.faceWidthNorm;
      estimatedDeviationCm = Number((displacement * cmPerNorm).toFixed(1));
    }

    return {
      eventType,
      timestamp: new Date(now).toISOString(),
      timeLabel: new Date(now).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      severity: extra.severity || 'MEDIUM',
      direction: extra.direction || null,
      estimatedDeviationNorm: Number(displacement.toFixed(4)),
      estimatedDeviationCm,
      confidence: this.usingMediaPipe ? 0.92 : 0.72,
      headPose: {
        yaw:   Number(this.smoothedYaw.toFixed(1)),
        pitch: Number(this.smoothedPitch.toFixed(1)),
        roll:  Number(this.smoothedRoll.toFixed(1)),
      },
      faceCount: extra.faceCount ?? 1,
      reason: extra.reason || eventType.replace(/_/g, ' '),
      ...extra,
    };
  }

  // ---------------------------------------------------------------------------
  // Main Frame Processor
  // ---------------------------------------------------------------------------

  /**
   * Process one analysis frame.
   *
   * @param {CanvasRenderingContext2D} ctx     - Canvas context (for skin-pixel fallback)
   * @param {number} width                     - Canvas width
   * @param {number} height                    - Canvas height
   * @param {object|null} headPoseData         - Result from headPoseEstimator.detectFrame()
   *
   * @returns {FrameResult} Telemetry object consumed by WebcamProctoring
   */
  processFrame(ctx, width, height, headPoseData = null) {
    const now = Date.now();
    let newFinalizedEvent = null;

    // ── Decide data source ────────────────────────────────────────────────
    let rawX, rawY, faceCount, currentFaceWidth, mediaPipeHeadPose;

    if (headPoseData && headPoseData.faceCount !== undefined) {
      // ── MediaPipe path ───────────────────────────────────────────────
      this.usingMediaPipe = true;
      faceCount = headPoseData.faceCount;
      currentFaceWidth = headPoseData.faceWidthNorm || 0;

      if (faceCount > 0 && headPoseData.faceCenterX !== undefined) {
        // MediaPipe X is NOT mirrored (video mirror handled by CSS)
        // Flip so left/right feels correct relative to student perspective
        rawX = 1 - headPoseData.faceCenterX;
        rawY = headPoseData.faceCenterY;
        mediaPipeHeadPose = headPoseData.headPose;
      }
    } else {
      // ── Skin-pixel fallback ──────────────────────────────────────────
      this.usingMediaPipe = false;
      const fallback = this._skinPixelAnalysis(ctx, width, height);
      faceCount = fallback.faceCount;
      rawX = fallback.rawX;
      rawY = fallback.rawY;
      currentFaceWidth = 0;
      mediaPipeHeadPose = null;
    }

    // Update face width EMA (for cm estimation)
    if (currentFaceWidth > 0) {
      this.faceWidthNorm = this.smooth(currentFaceWidth, this.faceWidthNorm || currentFaceWidth, 0.1);
    }

    // ── 0. MULTIPLE FACES CHECK ───────────────────────────────────────────
    if (faceCount >= 2) {
      if (!this.multipleFaceWarningTriggered && !this.isOnCooldown('MULTIPLE_FACES')) {
        this.eventCount++;
        this.markEventTime('MULTIPLE_FACES');
        this.lastEvent = 'MULTIPLE_FACES';
        newFinalizedEvent = this.buildEvent('MULTIPLE_FACES', {
          severity: 'HIGH',
          reason: 'Multiple faces detected in camera frame.',
          faceCount,
        });
        this.finalizedEvents.push(newFinalizedEvent);
        this.multipleFaceWarningTriggered = true;
      }
    } else {
      this.multipleFaceWarningTriggered = false;
    }

    // ── 1. NO FACE CHECK ─────────────────────────────────────────────────
    const isFacePresent = faceCount > 0 && rawX !== undefined;

    if (!isFacePresent) {
      if (!this.faceMissingStartTime) {
        this.faceMissingStartTime = now;
        this.faceMissingWarningTriggered = false;
      }

      const missingMs = now - this.faceMissingStartTime;

      if (missingMs >= this.config.faceMissingThresholdMs && !this.faceMissingWarningTriggered) {
        if (!this.isOnCooldown('FACE_NOT_DETECTED')) {
          this.eventCount++;
          this.markEventTime('FACE_NOT_DETECTED');
          this.lastEvent = 'FACE_NOT_DETECTED';
          newFinalizedEvent = this.buildEvent('FACE_NOT_DETECTED', {
            severity: 'HIGH',
            reason: 'Face not visible for 5 continuous seconds.',
            faceCount: 0,
            duration: 5,
          });
          this.finalizedEvents.push(newFinalizedEvent);
          this.faceMissingWarningTriggered = true;
        }
      }

      return this._buildReturn({
        faceCount: 0,
        isFacePresent: false,
        newFinalizedEvent,
        isWarningActive: false,
        warningDirection: null,
        sideDuration: 0,
        calibrationProgress: 100,
      });
    } else {
      this.faceMissingStartTime = null;
      this.faceMissingWarningTriggered = false;
    }

    // ── Apply EMA smoothing to position ───────────────────────────────────
    if (this.calibrationSamples.length === 0) {
      this.smoothedX = rawX;
      this.smoothedY = rawY;
    } else {
      this.smoothedX = this.smooth(rawX, this.smoothedX, this.config.smoothingAlpha);
      this.smoothedY = this.smooth(rawY, this.smoothedY, this.config.smoothingAlpha);
    }

    // Smooth orientation angles
    if (mediaPipeHeadPose) {
      this.smoothedYaw   = this.smooth(mediaPipeHeadPose.yaw,   this.smoothedYaw,   this.config.yawSmoothingAlpha);
      this.smoothedPitch = this.smooth(mediaPipeHeadPose.pitch, this.smoothedPitch, this.config.pitchSmoothingAlpha);
      this.smoothedRoll  = this.smooth(mediaPipeHeadPose.roll,  this.smoothedRoll,  0.2);
    }

    // ── 2. CALIBRATION PHASE ──────────────────────────────────────────────
    if (this.state === 'CALIBRATING') {
      if (!this.calibrationStartTime) {
        this.calibrationStartTime = now;
      }

      this.calibrationSamples.push(rawX);
      if (currentFaceWidth > 0) this.calibrationFaceWidths.push(currentFaceWidth);

      const elapsed = now - this.calibrationStartTime;
      const progress = Math.min(100, Math.round((elapsed / this.config.calibrationWindowMs) * 100));

      if (elapsed >= this.config.calibrationWindowMs && this.calibrationSamples.length >= 5) {
        const sum = this.calibrationSamples.reduce((a, b) => a + b, 0);
        this.centerX = sum / this.calibrationSamples.length;
        this.centerY = this.smoothedY;

        // Store average face width from calibration for cm estimation
        if (this.calibrationFaceWidths.length > 0) {
          const wSum = this.calibrationFaceWidths.reduce((a, b) => a + b, 0);
          this.calibrationAverageFaceWidth = wSum / this.calibrationFaceWidths.length;
          this.faceWidthNorm = this.calibrationAverageFaceWidth;
        }

        this.state = 'CENTER';
        this.previousState = 'CENTER';
        this.currentZoneStartTime = now;
        this.orientationZoneStartTime = now;
      }

      return this._buildReturn({
        faceCount,
        isFacePresent: true,
        newFinalizedEvent: null,
        isWarningActive: false,
        warningDirection: null,
        sideDuration: 0,
        calibrationProgress: progress,
        overrideState: 'CALIBRATING',
      });
    }

    // ── 3. LATERAL POSITION ZONE CLASSIFICATION ───────────────────────────
    const displacement = this.smoothedX - this.centerX;
    const { slightFraction, significantFraction } = this.config;

    // Adjust thresholds dynamically using face width (cm-based) if available
    let effectiveSlight = slightFraction;
    let effectiveSignificant = significantFraction;
    if (this.faceWidthNorm > 0.05) {
      const INTER_EYE_CM = 6.3;
      const cmPerNorm = INTER_EYE_CM / this.faceWidthNorm;
      // Target: 10cm significant, 4cm slight
      effectiveSignificant = this.config.HEAD_MOVEMENT_THRESHOLD_CM / cmPerNorm;
      effectiveSlight = (this.config.HEAD_MOVEMENT_THRESHOLD_CM * 0.4) / cmPerNorm;
    }

    const rawZone = classifyLateralZone(displacement, effectiveSlight, effectiveSignificant);

    // ── Zone Stabilization (debounce) ─────────────────────────────────────
    if (rawZone !== this.state) {
      if (this.transitionCandidate !== rawZone) {
        this.transitionCandidate = rawZone;
        this.transitionStartTime = now;
      } else if (now - this.transitionStartTime >= this.config.stabilityMs) {
        // Confirmed transition
        this.previousState = this.state;
        this.state = rawZone;
        this.currentZoneStartTime = now;
        this.transitionCandidate = null;
        this.offCenterWarningTriggered = false;
      }
    } else {
      this.transitionCandidate = null;
    }

    // ── 4. LATERAL DURATION EVENT (1.5s hold beyond 10cm threshold) ─────
    const isSignificantState = isSignificantOffCenter(this.state);
    const offCenterDurationMs = isSignificantState ? (now - this.currentZoneStartTime) : 0;
    const offCenterDurationSec = Number((offCenterDurationMs / 1000).toFixed(1));

    if (isSignificantState && offCenterDurationMs >= this.config.continuousDurationMs && !this.offCenterWarningTriggered) {
      const eventType = zoneToEventType(this.state);
      if (eventType && !this.isOnCooldown(eventType)) {
        const direction = this.state.includes('LEFT') ? 'LEFT' : 'RIGHT';
        this.eventCount++;
        this.markEventTime(eventType);
        this.lastEvent = eventType;
        newFinalizedEvent = this.buildEvent(eventType, {
          severity: 'HIGH',
          direction,
          reason: `Head moved beyond 10 cm ${direction.toLowerCase()} from calibrated center position.`,
          faceCount,
        });
        this.finalizedEvents.push(newFinalizedEvent);
        this.offCenterWarningTriggered = true;
      }
    }

    // Reset warning trigger when returning inside the 10cm safe zone
    if (!isSignificantState) {
      this.offCenterWarningTriggered = false;
    }

    // ── 5. HEAD ORIENTATION CLASSIFICATION ───────────────────────────────
    let rawOrientationState = 'HEAD_NORMAL';
    if (this.usingMediaPipe && mediaPipeHeadPose) {
      const { yawThresholdDeg, pitchUpThresholdDeg, pitchDownThresholdDeg } = this.config;
      if (Math.abs(this.smoothedYaw) > yawThresholdDeg) {
        rawOrientationState = this.smoothedYaw < 0 ? 'HEAD_LOOKING_LEFT' : 'HEAD_LOOKING_RIGHT';
      } else if (this.smoothedPitch < pitchUpThresholdDeg) {
        rawOrientationState = 'HEAD_LOOKING_UP';
      } else if (this.smoothedPitch > pitchDownThresholdDeg) {
        rawOrientationState = 'HEAD_LOOKING_DOWN';
      }
    }

    // Orientation stabilization
    if (rawOrientationState !== this.orientationState) {
      if (this.orientationCandidate !== rawOrientationState) {
        this.orientationCandidate = rawOrientationState;
        this.orientationCandidateStartTime = now;
      } else if (now - this.orientationCandidateStartTime >= this.config.stabilityMs) {
        this.previousOrientationState = this.orientationState;
        this.orientationState = rawOrientationState;
        this.orientationZoneStartTime = now;
        this.orientationCandidate = null;
        this.orientationWarningTriggered = false;
      }
    } else {
      this.orientationCandidate = null;
    }

    // ── 6. ORIENTATION DURATION EVENT (1.5s hold) ────────────────────────
    const isAbnormalOrientation = this.orientationState !== 'HEAD_NORMAL';
    const orientationDurationMs = isAbnormalOrientation ? (now - this.orientationZoneStartTime) : 0;

    if (
      isAbnormalOrientation &&
      orientationDurationMs >= this.config.continuousDurationMs &&
      !this.orientationWarningTriggered &&
      !newFinalizedEvent  // Don't double-fire in same frame
    ) {
      const orientEventMap = {
        HEAD_LOOKING_LEFT:  'HEAD_LOOKING_LEFT',
        HEAD_LOOKING_RIGHT: 'HEAD_LOOKING_RIGHT',
        HEAD_LOOKING_UP:    'HEAD_LOOKING_UP',
        HEAD_LOOKING_DOWN:  'HEAD_LOOKING_DOWN',
      };
      const orientEventType = orientEventMap[this.orientationState];

      if (orientEventType && !this.isOnCooldown(orientEventType)) {
        this.eventCount++;
        this.markEventTime(orientEventType);
        this.lastEvent = orientEventType;
        const orientEvt = this.buildEvent(orientEventType, {
          severity: orientEventType === 'HEAD_LOOKING_UP' ? 'LOW' : 'MEDIUM',
          direction: this.orientationState.includes('LEFT') ? 'LEFT'
                   : this.orientationState.includes('RIGHT') ? 'RIGHT'
                   : this.orientationState.includes('UP') ? 'UP' : 'DOWN',
          reason: `Head orientation: ${this.orientationState.replace(/_/g, ' ').toLowerCase()}.`,
          yaw:   Number(this.smoothedYaw.toFixed(1)),
          pitch: Number(this.smoothedPitch.toFixed(1)),
          roll:  Number(this.smoothedRoll.toFixed(1)),
          faceCount,
        });
        this.finalizedEvents.push(orientEvt);
        this.orientationWarningTriggered = true;

        // Only override newFinalizedEvent if no lateral event this frame
        if (!newFinalizedEvent) {
          newFinalizedEvent = orientEvt;
        }
      }
    }

    if (!isAbnormalOrientation) {
      this.orientationWarningTriggered = false;
    }

    // ── Telemetry Data Point for Graph ───────────────────────────────────
    const isWarningActive = isSignificantState;
    const warningDirection = this.state.includes('LEFT') ? 'LEFT'
                           : this.state.includes('RIGHT') ? 'RIGHT' : null;

    const bounds = this.getBoundaries();
    const dataPoint = {
      timestamp: now,
      timeLabel: new Date(now).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
      smoothedX: Number(this.smoothedX.toFixed(4)),
      centerX: Number(this.centerX.toFixed(4)),
      leftTrigger: Number(bounds.leftTrigger.toFixed(4)),
      rightTrigger: Number(bounds.rightTrigger.toFixed(4)),
      state: this.state,
      isWarning: isWarningActive,
      isNewEventMarker: !!newFinalizedEvent,
      eventDirection: warningDirection,
      yaw: Number(this.smoothedYaw.toFixed(1)),
      pitch: Number(this.smoothedPitch.toFixed(1)),
    };

    this.history.push(dataPoint);
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }

    return this._buildReturn({
      faceCount,
      isFacePresent: true,
      newFinalizedEvent,
      isWarningActive,
      warningDirection,
      sideDuration: offCenterDurationSec,
      calibrationProgress: 100,
    });
  }

  // ---------------------------------------------------------------------------
  // Return shape builder
  // ---------------------------------------------------------------------------

  _buildReturn({ faceCount, isFacePresent, newFinalizedEvent, isWarningActive, warningDirection, sideDuration, calibrationProgress, overrideState }) {
    const displacement = Math.abs(this.smoothedX - this.centerX);
    let estimatedDeviationCm = null;
    if (this.faceWidthNorm > 0.05) {
      const cmPerNorm = 6.3 / this.faceWidthNorm;
      estimatedDeviationCm = Number((displacement * cmPerNorm).toFixed(1));
    }

    return {
      // Core
      faceCount,
      state: overrideState || this.state,
      previousState: this.previousState,
      isFacePresent,
      calibrationProgress: calibrationProgress ?? 100,

      // Position
      rawX: Number(this.smoothedX.toFixed(4)),
      smoothedX: Number(this.smoothedX.toFixed(4)),
      centerX: Number(this.centerX.toFixed(4)),
      boundaries: this.getBoundaries(),

      // Head pose
      headPose: {
        yaw:   Number(this.smoothedYaw.toFixed(1)),
        pitch: Number(this.smoothedPitch.toFixed(1)),
        roll:  Number(this.smoothedRoll.toFixed(1)),
      },
      orientationState: this.orientationState,
      previousOrientationState: this.previousOrientationState,

      // Deviation
      estimatedDeviationNorm: Number(displacement.toFixed(4)),
      estimatedDeviationCm,
      usingMediaPipe: this.usingMediaPipe,

      // Duration & events
      sideDuration,
      eventCount: this.eventCount,
      lastEvent: this.lastEvent,
      newFinalizedEvent,

      // Warning
      isWarningActive,
      warningDirection,
    };
  }

  // ---------------------------------------------------------------------------
  // Skin-pixel fallback (preserved from original for non-MediaPipe environments)
  // ---------------------------------------------------------------------------

  _skinPixelAnalysis(ctx, width, height) {
    const frameData = ctx.getImageData(0, 0, width, height).data;

    const columns = 20;
    const columnCounts = new Array(columns).fill(0);
    let skinPixelCount = 0;
    let sumX = 0;
    let sumY = 0;
    let totalLuminance = 0;

    for (let i = 0; i < frameData.length; i += 16) {
      const r = frameData[i];
      const g = frameData[i + 1];
      const b = frameData[i + 2];

      totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;

      if (r > 50 && g > 35 && b > 20 && r > g && r > b && (Math.max(r, g, b) - Math.min(r, g, b) > 12)) {
        skinPixelCount++;
        const pixelIdx = i / 4;
        const x = pixelIdx % width;
        const y = Math.floor(pixelIdx / width);
        sumX += x;
        sumY += y;
        const colIdx = Math.min(columns - 1, Math.floor((x / width) * columns));
        columnCounts[colIdx]++;
      }
    }

    const totalPixels = width * height;
    const avgLuminance = totalLuminance / (totalPixels / 4);
    const isFacePresent = skinPixelCount > 35 && avgLuminance > 12;

    let activeColumns = 0;
    let peaks = 0;
    for (let c = 1; c < columns - 1; c++) {
      if (columnCounts[c] > 15) activeColumns++;
      if (columnCounts[c] > 20 && columnCounts[c] > columnCounts[c - 1] && columnCounts[c] > columnCounts[c + 1]) {
        peaks++;
      }
    }
    const faceCount = !isFacePresent ? 0 : (peaks >= 2 && activeColumns >= 8) ? 2 : 1;

    if (!isFacePresent || skinPixelCount === 0) {
      return { faceCount: 0, rawX: undefined, rawY: undefined };
    }

    const rawX = 1 - (sumX / skinPixelCount) / width;
    const rawY = (sumY / skinPixelCount) / height;

    return { faceCount, rawX, rawY };
  }
}
