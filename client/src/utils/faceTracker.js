/**
 * Face Movement Detection Engine — Technical Specification Compliance
 * Head-Position-Only Detector with Calibration, Safe Zone, Hysteresis,
 * Debounced State Machine, and Discrete Event Schema.
 */

export const DEFAULT_CONFIG = {
  faceZoneRadius: 0.05,       // Normalized units (~5cm equivalent lateral radius)
  hysteresisMargin: 0.01,     // 20% of faceZoneRadius (re-arm margin)
  smoothingAlpha: 0.2,        // Exponential moving average alpha
  stabilityMs: 200,           // Short debounce ms before state transition
  calibrationWindowMs: 1500,  // Calibration stabilization window
};

export class HeadPositionTracker {
  constructor(customConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
    this.reset();
  }

  reset() {
    this.state = 'CALIBRATING'; // 'CALIBRATING' | 'CENTER' | 'LEFT_OUTSIDE' | 'RIGHT_OUTSIDE'
    this.centerX = 0.5;
    this.smoothedX = 0.5;
    this.smoothedY = 0.5;

    // Calibration buffer
    this.calibrationStartTime = null;
    this.calibrationSamples = [];

    // State machine & Debounce
    this.crossingCandidate = null; // 'LEFT_OUTSIDE' or 'RIGHT_OUTSIDE'
    this.crossingStartTime = 0;

    // Active event tracking
    this.activeEvent = null;
    this.eventCount = 0;
    this.finalizedEvents = [];

    // Telemetry history for rolling graph
    this.history = [];
    this.maxHistoryLength = 60; // 60s @ 10fps = 600 points max, stored as samples
  }

  /**
   * Exponential Moving Average (EMA)
   */
  smooth(current, previous, alpha = this.config.smoothingAlpha) {
    return alpha * current + (1 - alpha) * previous;
  }

  /**
   * Recalculate Safe Zone & Hysteresis Boundaries
   */
  getBoundaries() {
    const radius = this.config.faceZoneRadius;
    const margin = this.config.hysteresisMargin;

    const leftLimit = this.centerX - radius;
    const rightLimit = this.centerX + radius;

    return {
      centerX: this.centerX,
      leftLimit,
      rightLimit,
      leftTrigger: leftLimit,
      leftRearm: leftLimit + margin,
      rightTrigger: rightLimit,
      rightRearm: rightLimit - margin,
    };
  }

  /**
   * Process a single video frame canvas image data
   */
  processFrame(ctx, width, height) {
    const now = Date.now();
    const frameData = ctx.getImageData(0, 0, width, height).data;
    const totalPixels = width * height;

    let skinPixelCount = 0;
    let sumX = 0;
    let sumY = 0;
    let totalLuminance = 0;

    for (let i = 0; i < frameData.length; i += 16) {
      const r = frameData[i];
      const g = frameData[i + 1];
      const b = frameData[i + 2];

      totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;

      // Skin pixel centroid heuristic for head position
      if (r > 50 && g > 35 && b > 20 && r > g && r > b && (Math.max(r, g, b) - Math.min(r, g, b) > 12)) {
        skinPixelCount++;
        const pixelIdx = i / 4;
        const x = pixelIdx % width;
        const y = Math.floor(pixelIdx / width);
        sumX += x;
        sumY += y;
      }
    }

    const avgLuminance = totalLuminance / (totalPixels / 4);
    const isFacePresent = skinPixelCount > 35 && avgLuminance > 12;

    if (!isFacePresent) {
      return {
        state: this.state,
        isFacePresent: false,
        rawX: this.centerX,
        smoothedX: this.smoothedX,
        centerX: this.centerX,
        boundaries: this.getBoundaries(),
        eventCount: this.eventCount,
        newFinalizedEvent: null,
        isWarningActive: false,
        warningDirection: null,
      };
    }

    // Normalized horizontal coordinate (mirrored video 1 - x/w)
    const rawX = 1 - (sumX / skinPixelCount) / width;
    const rawY = (sumY / skinPixelCount) / height;

    // Apply EMA Smoothing
    if (this.calibrationSamples.length === 0) {
      this.smoothedX = rawX;
      this.smoothedY = rawY;
    } else {
      this.smoothedX = this.smooth(rawX, this.smoothedX);
      this.smoothedY = this.smooth(rawY, this.smoothedY);
    }

    // ── 1. CALIBRATION PHASE ──────────────────────────────────
    if (this.state === 'CALIBRATING') {
      if (!this.calibrationStartTime) {
        this.calibrationStartTime = now;
      }

      this.calibrationSamples.push(rawX);

      const elapsed = now - this.calibrationStartTime;
      if (elapsed >= this.config.calibrationWindowMs && this.calibrationSamples.length >= 5) {
        // Calculate mean of samples
        const sum = this.calibrationSamples.reduce((a, b) => a + b, 0);
        this.centerX = sum / this.calibrationSamples.length;
        this.state = 'CENTER';
      }

      return {
        state: 'CALIBRATING',
        calibrationProgress: Math.min(100, Math.round((elapsed / this.config.calibrationWindowMs) * 100)),
        isFacePresent: true,
        rawX,
        smoothedX: this.smoothedX,
        centerX: this.centerX,
        boundaries: this.getBoundaries(),
        eventCount: 0,
        newFinalizedEvent: null,
        isWarningActive: false,
        warningDirection: null,
      };
    }

    // ── 2. TRACKING & STATE MACHINE ───────────────────────────
    const bounds = this.getBoundaries();
    const currentX = this.smoothedX;
    let newFinalizedEvent = null;

    if (this.state === 'CENTER') {
      // Check for candidate trigger crossings
      if (currentX < bounds.leftTrigger) {
        if (this.crossingCandidate !== 'LEFT_OUTSIDE') {
          this.crossingCandidate = 'LEFT_OUTSIDE';
          this.crossingStartTime = now;
        } else if (now - this.crossingStartTime >= this.config.stabilityMs) {
          // Confirmed transition: CENTER -> LEFT_OUTSIDE
          this.state = 'LEFT_OUTSIDE';
          this.eventCount++;
          this.activeEvent = {
            eventType: 'FACE_MOVEMENT',
            direction: 'LEFT',
            startTime: now,
            startTimestampIso: new Date(now).toISOString(),
            peakDeviation: Math.abs(currentX - this.centerX),
            confidence: Math.min(0.98, 0.70 + (skinPixelCount / 300) * 0.28),
          };
          this.crossingCandidate = null;
        }
      } else if (currentX > bounds.rightTrigger) {
        if (this.crossingCandidate !== 'RIGHT_OUTSIDE') {
          this.crossingCandidate = 'RIGHT_OUTSIDE';
          this.crossingStartTime = now;
        } else if (now - this.crossingStartTime >= this.config.stabilityMs) {
          // Confirmed transition: CENTER -> RIGHT_OUTSIDE
          this.state = 'RIGHT_OUTSIDE';
          this.eventCount++;
          this.activeEvent = {
            eventType: 'FACE_MOVEMENT',
            direction: 'RIGHT',
            startTime: now,
            startTimestampIso: new Date(now).toISOString(),
            peakDeviation: Math.abs(currentX - this.centerX),
            confidence: Math.min(0.98, 0.70 + (skinPixelCount / 300) * 0.28),
          };
          this.crossingCandidate = null;
        }
      } else {
        // Returned inside triggers before stabilityMs passed
        this.crossingCandidate = null;
      }
    } else if (this.state === 'LEFT_OUTSIDE') {
      // Update peak deviation while outside
      if (this.activeEvent) {
        const currentDev = Math.abs(currentX - this.centerX);
        if (currentDev > this.activeEvent.peakDeviation) {
          this.activeEvent.peakDeviation = currentDev;
        }
      }

      // Re-arm condition: Must cross back past LEFT_REARM
      if (currentX >= bounds.leftRearm) {
        const durationSec = Math.max(0.1, Number(((now - this.activeEvent.startTime) / 1000).toFixed(2)));
        newFinalizedEvent = {
          eventType: 'FACE_MOVEMENT',
          direction: 'LEFT',
          timestamp: this.activeEvent.startTimestampIso,
          peakDeviation: Number(this.activeEvent.peakDeviation.toFixed(4)),
          duration: durationSec,
          confidence: Number(this.activeEvent.confidence.toFixed(2)),
          timeLabel: new Date(this.activeEvent.startTime).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
        };

        this.finalizedEvents.push(newFinalizedEvent);
        this.activeEvent = null;
        this.state = 'CENTER';
      }
    } else if (this.state === 'RIGHT_OUTSIDE') {
      // Update peak deviation while outside
      if (this.activeEvent) {
        const currentDev = Math.abs(currentX - this.centerX);
        if (currentDev > this.activeEvent.peakDeviation) {
          this.activeEvent.peakDeviation = currentDev;
        }
      }

      // Re-arm condition: Must cross back past RIGHT_REARM
      if (currentX <= bounds.rightRearm) {
        const durationSec = Math.max(0.1, Number(((now - this.activeEvent.startTime) / 1000).toFixed(2)));
        newFinalizedEvent = {
          eventType: 'FACE_MOVEMENT',
          direction: 'RIGHT',
          timestamp: this.activeEvent.startTimestampIso,
          peakDeviation: Number(this.activeEvent.peakDeviation.toFixed(4)),
          duration: durationSec,
          confidence: Number(this.activeEvent.confidence.toFixed(2)),
          timeLabel: new Date(this.activeEvent.startTime).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
        };

        this.finalizedEvents.push(newFinalizedEvent);
        this.activeEvent = null;
        this.state = 'CENTER';
      }
    }

    // Record data point for graph
    const isWarningActive = this.state === 'LEFT_OUTSIDE' || this.state === 'RIGHT_OUTSIDE';
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
      eventDirection: this.state === 'LEFT_OUTSIDE' ? 'LEFT' : this.state === 'RIGHT_OUTSIDE' ? 'RIGHT' : null,
    };

    this.history.push(dataPoint);
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }

    return {
      state: this.state,
      isFacePresent: true,
      rawX,
      smoothedX: this.smoothedX,
      centerX: this.centerX,
      boundaries: bounds,
      eventCount: this.eventCount,
      newFinalizedEvent,
      isWarningActive,
      warningDirection: this.state === 'LEFT_OUTSIDE' ? 'LEFT' : this.state === 'RIGHT_OUTSIDE' ? 'RIGHT' : null,
    };
  }
}
