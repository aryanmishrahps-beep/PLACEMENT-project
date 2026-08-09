/**
 * Face Tracker Utility — Normalized Movement, EMA Smoothing & Head Pose Estimation
 */

export const CONFIG = {
  ALPHA: 0.25, // Exponential moving average smoothing factor
  MIN_FACE_MOVEMENT_THRESHOLD: 0.22, // 22% normalized movement threshold
  HEAD_YAW_THRESHOLD: 15,            // 15 degrees
  HEAD_PITCH_THRESHOLD: 12,          // 12 degrees
  HEAD_ROLL_THRESHOLD: 10,           // 10 degrees
  WARNING_COOLDOWN_MS: 3000,         // 3s cooldown between warning notifications
};

export class FaceTracker {
  constructor() {
    this.reset();
  }

  reset() {
    this.smoothedX = 0.5;
    this.smoothedY = 0.5;
    this.smoothedYaw = 0;
    this.smoothedPitch = 0;
    this.smoothedRoll = 0;
    this.lastWarningTime = 0;
    this.history = [];
    this.maxHistoryLength = 60; // 60 seconds of data points
  }

  /**
   * Smooths raw values using Exponential Moving Average (EMA)
   */
  smooth(current, previous, alpha = CONFIG.ALPHA) {
    return alpha * current + (1 - alpha) * previous;
  }

  /**
   * Process a single video frame canvas image data
   */
  processFrame(ctx, width, height) {
    const frameData = ctx.getImageData(0, 0, width, height).data;
    const totalPixels = width * height;

    let skinPixelCount = 0;
    let sumX = 0;
    let sumY = 0;
    let leftQ = 0;
    let rightQ = 0;
    let topQ = 0;
    let bottomQ = 0;
    let totalLuminance = 0;

    for (let i = 0; i < frameData.length; i += 16) {
      const r = frameData[i];
      const g = frameData[i + 1];
      const b = frameData[i + 2];

      totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;

      // Skin pixel detection heuristic
      if (r > 50 && g > 35 && b > 20 && r > g && r > b && (Math.max(r, g, b) - Math.min(r, g, b) > 12)) {
        skinPixelCount++;
        const pixelIdx = i / 4;
        const x = pixelIdx % width;
        const y = Math.floor(pixelIdx / width);

        sumX += x;
        sumY += y;

        if (x < width * 0.4) leftQ++;
        else if (x > width * 0.6) rightQ++;

        if (y < height * 0.45) topQ++;
        else if (y > height * 0.55) bottomQ++;
      }
    }

    const avgLuminance = totalLuminance / (totalPixels / 4);
    const isFacePresent = skinPixelCount > 35 && avgLuminance > 12;

    if (!isFacePresent) {
      return {
        isFacePresent: false,
        magnitudePct: 0,
        direction: 'NONE',
        rawX: 0.5,
        rawY: 0.5,
        normX: 0.5,
        normY: 0.5,
        yaw: 0,
        pitch: 0,
        roll: 0,
        confidence: 0,
        severity: 'NONE'
      };
    }

    // Raw normalized centroid (note video mirroring: 1 - x/width)
    const rawX = 1 - (sumX / skinPixelCount) / width;
    const rawY = (sumY / skinPixelCount) / height;

    // Apply EMA Smoothing to coordinates
    this.smoothedX = this.smooth(rawX, this.smoothedX);
    this.smoothedY = this.smooth(rawY, this.smoothedY);

    // Calculate Head Pose (Yaw & Pitch estimation)
    const lrTotal = leftQ + rightQ + 1;
    const rawYaw = ((rightQ - leftQ) / lrTotal) * 45; // -45 deg to +45 deg

    const tbTotal = topQ + bottomQ + 1;
    const rawPitch = ((bottomQ - topQ) / tbTotal) * 35; // -35 deg to +35 deg

    const rawRoll = (rawX - 0.5) * 20;

    // Apply EMA Smoothing to angles
    this.smoothedYaw = this.smooth(rawYaw, this.smoothedYaw);
    this.smoothedPitch = this.smooth(rawPitch, this.smoothedPitch);
    this.smoothedRoll = this.smooth(rawRoll, this.smoothedRoll);

    // Normalized Delta from Center (0.5, 0.5)
    const deltaX = this.smoothedX - 0.5;
    const deltaY = this.smoothedY - 0.5;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Calculate Magnitude % (0 - 100%)
    // Normalized distance of 0.25 corresponds to 100% max movement
    const movementMag = Math.min(1.0, distance / 0.25);
    const magnitudePct = Math.round(movementMag * 100);

    // Direction classification
    let direction = 'CENTER';
    if (Math.abs(deltaX) > 0.06 || Math.abs(deltaY) > 0.06) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'RIGHT' : 'LEFT';
      } else {
        direction = deltaY > 0 ? 'DOWN' : 'UP';
      }
    }

    // Severity classification
    let severity = 'NORMAL';
    if (magnitudePct >= 70) severity = 'HIGH MOVEMENT';
    else if (magnitudePct >= 40) severity = 'MODERATE MOVEMENT';
    else if (magnitudePct >= 20) severity = 'LOW MOVEMENT';

    // Confidence heuristic based on pixel count
    const confidence = Math.min(0.98, 0.70 + (skinPixelCount / 300) * 0.28);

    const now = Date.now();
    const isWarningTrigger =
      (magnitudePct >= CONFIG.MIN_FACE_MOVEMENT_THRESHOLD * 100 ||
        Math.abs(this.smoothedYaw) > CONFIG.HEAD_YAW_THRESHOLD ||
        Math.abs(this.smoothedPitch) > CONFIG.HEAD_PITCH_THRESHOLD) &&
      now - this.lastWarningTime >= CONFIG.WARNING_COOLDOWN_MS;

    if (isWarningTrigger) {
      this.lastWarningTime = now;
    }

    const dataPoint = {
      timestamp: now,
      timeLabel: new Date(now).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
      normX: Number(this.smoothedX.toFixed(3)),
      normY: Number(this.smoothedY.toFixed(3)),
      yaw: Number(this.smoothedYaw.toFixed(1)),
      pitch: Number(this.smoothedPitch.toFixed(1)),
      roll: Number(this.smoothedRoll.toFixed(1)),
      magnitudePct,
      direction,
      severity,
      confidence: Number(confidence.toFixed(2)),
      isWarning: isWarningTrigger,
      isFacePresent: true,
    };

    this.history.push(dataPoint);
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }

    return {
      ...dataPoint,
      shouldTriggerWarning: isWarningTrigger
    };
  }
}
