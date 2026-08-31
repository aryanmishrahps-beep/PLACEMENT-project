/**
 * Face Movement & Multi-Face Detection Engine
 * Technical Specification Compliant:
 * - Calibrated CENTER_X position
 * - Configurable lateral thresholds with stabilization (300-500ms)
 * - State machine for LEFT, CENTER, RIGHT
 * - 5-Second continuous side duration detection (LEFT_SIDE_5_SECONDS, RIGHT_SIDE_5_SECONDS)
 * - Transitions: LEFT -> CENTER, RIGHT -> CENTER
 * - Face missing detection (FACE_NOT_DETECTED for 5 continuous seconds)
 * - Multi-face detection (MULTIPLE_FACES)
 * - Warning Cooldown (2000ms)
 * - Developer Telemetry & Debug metrics
 */

export const DEFAULT_CONFIG = {
  faceZoneRadius: 0.04,       // Responsive lateral movement threshold (~5cm equivalent)
  hysteresisMargin: 0.01,     // Hysteresis re-arm margin
  smoothingAlpha: 0.3,        // EMA alpha for smooth yet responsive tracking
  stabilityMs: 250,           // Fast 250ms stabilization for natural head turns
  calibrationWindowMs: 2500,  // 2.5s Calibration window
  cooldownMs: 1500,           // 1.5s Cooldown between warning events
};

export class HeadPositionTracker {
  constructor(customConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
    this.reset();
  }

  reset() {
    this.state = 'CALIBRATING'; // 'CALIBRATING' | 'CENTER' | 'LEFT' | 'RIGHT'
    this.previousState = 'CENTER';
    this.centerX = 0.5;
    this.smoothedX = 0.5;
    this.smoothedY = 0.5;

    // Calibration buffer
    this.calibrationStartTime = null;
    this.calibrationSamples = [];

    // State transition candidate & timing
    this.transitionCandidate = null; // 'LEFT', 'RIGHT', 'CENTER'
    this.transitionStartTime = 0;
    this.currentZoneStartTime = Date.now();

    // 5-Second side tracking
    this.sideWarningTriggered = false;

    // Missing Face tracking
    this.faceMissingStartTime = null;
    this.faceMissingWarningTriggered = false;

    // Multi-Face tracking
    this.multipleFaceWarningTriggered = false;

    // Cooldown tracking
    this.lastWarningTime = 0;

    // Event logs & history
    this.eventCount = 0;
    this.lastEvent = 'NONE';
    this.finalizedEvents = [];

    // Telemetry history for graph
    this.history = [];
    this.maxHistoryLength = 60;
  }

  smooth(current, previous, alpha = this.config.smoothingAlpha) {
    return alpha * current + (1 - alpha) * previous;
  }

  getBoundaries() {
    const radius = this.config.faceZoneRadius;
    const margin = this.config.hysteresisMargin;

    const leftTrigger = this.centerX - radius;
    const rightTrigger = this.centerX + radius;

    return {
      centerX: this.centerX,
      leftTrigger,
      leftRearm: leftTrigger + margin,
      rightTrigger,
      rightRearm: rightTrigger - margin,
      threshold: radius,
    };
  }

  /**
   * Process canvas image frame to analyze face position and face count
   */
  processFrame(ctx, width, height) {
    const now = Date.now();
    const frameData = ctx.getImageData(0, 0, width, height).data;
    
    // Grid sampling for performance (sampling every 16th pixel = ~1200 checks)
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

      // Skin pixel heuristic
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

    // Detect Multi-Face Clusters via spatial column peaks
    let activeColumns = 0;
    let peaks = 0;
    for (let c = 1; c < columns - 1; c++) {
      if (columnCounts[c] > 15) activeColumns++;
      if (columnCounts[c] > 20 && columnCounts[c] > columnCounts[c - 1] && columnCounts[c] > columnCounts[c + 1]) {
        peaks++;
      }
    }
    const faceCount = !isFacePresent ? 0 : (peaks >= 2 && activeColumns >= 8) ? 2 : 1;

    let newFinalizedEvent = null;

    // ── 0. MULTIPLE FACES CHECK ────────────────────────────────
    if (faceCount >= 2) {
      if (!this.multipleFaceWarningTriggered && (now - this.lastWarningTime >= this.config.cooldownMs)) {
        this.eventCount++;
        this.lastWarningTime = now;
        this.lastEvent = 'MULTIPLE_FACES';
        newFinalizedEvent = {
          eventType: 'MULTIPLE_FACES',
          reason: 'Multiple faces detected in camera frame.',
          timestamp: new Date(now).toISOString(),
          faceCount,
        };
        this.finalizedEvents.push(newFinalizedEvent);
        this.multipleFaceWarningTriggered = true;
      }
    } else {
      this.multipleFaceWarningTriggered = false;
    }

    // ── 1. NO FACE DETECTED CHECK ──────────────────────────────
    if (!isFacePresent) {
      if (!this.faceMissingStartTime) {
        this.faceMissingStartTime = now;
        this.faceMissingWarningTriggered = false;
      }

      if (now - this.faceMissingStartTime >= 5000 && !this.faceMissingWarningTriggered) {
        if (now - this.lastWarningTime >= this.config.cooldownMs) {
          this.eventCount++;
          this.lastWarningTime = now;
          this.lastEvent = 'FACE_NOT_DETECTED';
          newFinalizedEvent = {
            eventType: 'FACE_NOT_DETECTED',
            reason: 'Face not visible for 5 continuous seconds.',
            timestamp: new Date(now).toISOString(),
            duration: 5,
          };
          this.finalizedEvents.push(newFinalizedEvent);
          this.faceMissingWarningTriggered = true;
        }
      }

      return {
        faceCount: 0,
        state: this.state,
        previousState: this.previousState,
        isFacePresent: false,
        rawX: this.centerX,
        smoothedX: this.smoothedX,
        centerX: this.centerX,
        boundaries: this.getBoundaries(),
        sideDuration: 0,
        eventCount: this.eventCount,
        lastEvent: this.lastEvent,
        newFinalizedEvent,
        isWarningActive: false,
        warningDirection: null,
      };
    } else {
      this.faceMissingStartTime = null;
    }

    // Normalized horizontal coordinate (mirrored video 1 - x/w)
    const rawX = 1 - (sumX / skinPixelCount) / width;
    const rawY = (sumY / skinPixelCount) / height;

    // Apply Exponential Moving Average (EMA) Smoothing
    if (this.calibrationSamples.length === 0) {
      this.smoothedX = rawX;
      this.smoothedY = rawY;
    } else {
      this.smoothedX = this.smooth(rawX, this.smoothedX);
      this.smoothedY = this.smooth(rawY, this.smoothedY);
    }

    // ── 2. CALIBRATION PHASE ──────────────────────────────────
    if (this.state === 'CALIBRATING') {
      if (!this.calibrationStartTime) {
        this.calibrationStartTime = now;
      }

      this.calibrationSamples.push(rawX);
      const elapsed = now - this.calibrationStartTime;

      if (elapsed >= this.config.calibrationWindowMs && this.calibrationSamples.length >= 5) {
        const sum = this.calibrationSamples.reduce((a, b) => a + b, 0);
        this.centerX = sum / this.calibrationSamples.length;
        this.state = 'CENTER';
        this.previousState = 'CENTER';
        this.currentZoneStartTime = now;
      }

      return {
        faceCount: 1,
        state: 'CALIBRATING',
        previousState: 'CALIBRATING',
        calibrationProgress: Math.min(100, Math.round((elapsed / this.config.calibrationWindowMs) * 100)),
        isFacePresent: true,
        rawX: Number(rawX.toFixed(4)),
        smoothedX: Number(this.smoothedX.toFixed(4)),
        centerX: Number(this.centerX.toFixed(4)),
        boundaries: this.getBoundaries(),
        sideDuration: 0,
        eventCount: 0,
        lastEvent: 'NONE',
        newFinalizedEvent: null,
        isWarningActive: false,
        warningDirection: null,
      };
    }

    // ── 3. STATE MACHINE & STABILIZATION ───────────────────────
    const bounds = this.getBoundaries();
    const currentX = this.smoothedX;

    // Determine raw zone candidate
    let rawZoneCandidate = 'CENTER';
    if (currentX < bounds.leftTrigger) {
      rawZoneCandidate = 'LEFT';
    } else if (currentX > bounds.rightTrigger) {
      rawZoneCandidate = 'RIGHT';
    }

    // Zone Stabilization Debounce (requires face to stay in new zone for stabilityMs)
    if (rawZoneCandidate !== this.state) {
      if (this.transitionCandidate !== rawZoneCandidate) {
        this.transitionCandidate = rawZoneCandidate;
        this.transitionStartTime = now;
      } else if (now - this.transitionStartTime >= this.config.stabilityMs) {
        // Confirmed Zone Transition
        const oldZone = this.state;
        this.previousState = oldZone;
        this.state = rawZoneCandidate;
        this.currentZoneStartTime = now;
        this.transitionCandidate = null;
        this.sideWarningTriggered = false;

        // Check Valid Transition Events: LEFT -> CENTER or RIGHT -> CENTER
        if (oldZone === 'LEFT' && rawZoneCandidate === 'CENTER') {
          if (now - this.lastWarningTime >= this.config.cooldownMs) {
            this.eventCount++;
            this.lastWarningTime = now;
            this.lastEvent = 'LEFT_TO_CENTER';
            newFinalizedEvent = {
              eventType: 'LEFT_TO_CENTER',
              reason: 'Unusual face movement from LEFT to CENTER detected.',
              timestamp: new Date(now).toISOString(),
            };
            this.finalizedEvents.push(newFinalizedEvent);
          }
        } else if (oldZone === 'RIGHT' && rawZoneCandidate === 'CENTER') {
          if (now - this.lastWarningTime >= this.config.cooldownMs) {
            this.eventCount++;
            this.lastWarningTime = now;
            this.lastEvent = 'RIGHT_TO_CENTER';
            newFinalizedEvent = {
              eventType: 'RIGHT_TO_CENTER',
              reason: 'Unusual face movement from RIGHT to CENTER detected.',
              timestamp: new Date(now).toISOString(),
            };
            this.finalizedEvents.push(newFinalizedEvent);
          }
        }
      }
    } else {
      this.transitionCandidate = null;
    }

    // ── 4. CONTINUOUS 5-SECOND SIDE RULE ──────────────────────
    const sideDurationMs = (this.state === 'LEFT' || this.state === 'RIGHT') ? (now - this.currentZoneStartTime) : 0;
    const sideDurationSec = Number((sideDurationMs / 1000).toFixed(1));

    if ((this.state === 'LEFT' || this.state === 'RIGHT') && sideDurationMs >= 5000 && !this.sideWarningTriggered) {
      if (now - this.lastWarningTime >= this.config.cooldownMs) {
        const evtType = this.state === 'LEFT' ? 'LEFT_SIDE_5_SECONDS' : 'RIGHT_SIDE_5_SECONDS';
        this.eventCount++;
        this.lastWarningTime = now;
        this.lastEvent = evtType;
        newFinalizedEvent = {
          eventType: evtType,
          reason: `Face remained away from center (${this.state}) for more than 5 seconds.`,
          timestamp: new Date(now).toISOString(),
          duration: 5,
        };
        this.finalizedEvents.push(newFinalizedEvent);
        this.sideWarningTriggered = true;
      }
    }

    // Telemetry Data Point
    const isWarningActive = this.state === 'LEFT' || this.state === 'RIGHT';
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
      eventDirection: this.state === 'LEFT' ? 'LEFT' : this.state === 'RIGHT' ? 'RIGHT' : null,
    };

    this.history.push(dataPoint);
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }

    return {
      faceCount,
      state: this.state,
      previousState: this.previousState,
      isFacePresent: true,
      rawX: Number(rawX.toFixed(4)),
      smoothedX: Number(this.smoothedX.toFixed(4)),
      centerX: Number(this.centerX.toFixed(4)),
      boundaries: bounds,
      sideDuration: sideDurationSec,
      eventCount: this.eventCount,
      lastEvent: this.lastEvent,
      newFinalizedEvent,
      isWarningActive,
      warningDirection: this.state === 'LEFT' ? 'LEFT' : this.state === 'RIGHT' ? 'RIGHT' : null,
    };
  }
}
