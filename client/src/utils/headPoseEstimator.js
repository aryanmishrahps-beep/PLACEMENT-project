/**
 * Head Pose Estimator — MediaPipe Face Landmarker
 *
 * Lazy-loads the MediaPipe Tasks Vision library from CDN (WASM-based).
 * Falls back gracefully to null if the model is not ready yet, allowing
 * the faceTracker to use its skin-pixel centroid method in the interim.
 *
 * PRIVACY: Only geometric landmark coordinates are used.
 * No facial identity recognition is performed.
 * No video frames are stored or transmitted.
 *
 * Head Pose Angles (approximate, derived from 3D landmarks):
 *   Yaw   — horizontal rotation (left/right turning)
 *   Pitch — vertical rotation   (up/down tilting)
 *   Roll  — lateral tilt        (shoulder lean)
 */

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm';
const MEDIAPIPE_PKG = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12';

// Singleton state
let faceLandmarker = null;
let isLoading = false;
let loadFailed = false;
let lastVideoTime = -1;

/**
 * Dynamically load the MediaPipe Tasks Vision library from CDN.
 * Resolves once the FaceLandmarker is ready, or rejects on failure.
 */
async function loadMediaPipe() {
  if (faceLandmarker) return faceLandmarker;
  if (loadFailed) return null;
  if (isLoading) return null; // Caller will retry next frame

  isLoading = true;

  try {
    // Dynamic CDN import — works in all modern browsers without bundling
    const vision = await import(/* @vite-ignore */ `${MEDIAPIPE_PKG}/vision_bundle.mjs`);

    const { FaceLandmarker, FilesetResolver } = vision;

    const filesetResolver = await FilesetResolver.forVisionTasks(MEDIAPIPE_CDN);

    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: `${MEDIAPIPE_PKG}/face_landmarker.task`,
        delegate: 'GPU',
      },
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: true,  // needed for yaw/pitch/roll
      runningMode: 'VIDEO',
      numFaces: 2, // Detect up to 2 faces for multi-face detection
    });

    console.info('[HeadPoseEstimator] MediaPipe Face Landmarker ready.');
    isLoading = false;
    return faceLandmarker;
  } catch (err) {
    console.warn('[HeadPoseEstimator] MediaPipe load failed, using fallback skin-pixel tracker:', err.message);
    loadFailed = true;
    isLoading = false;
    return null;
  }
}

/**
 * Extract yaw, pitch, roll from a 4x4 facial transformation matrix.
 * The matrix is provided by MediaPipe FaceLandmarker when
 * outputFacialTransformationMatrixes = true.
 *
 * Matrix layout (column-major, OpenGL convention):
 *   [0]  [4]  [8]  [12]
 *   [1]  [5]  [9]  [13]
 *   [2]  [6]  [10] [14]
 *   [3]  [7]  [11] [15]
 *
 * @param {number[]} matrix - 16-element flat array
 * @returns {{ yaw: number, pitch: number, roll: number }} degrees
 */
function matrixToAngles(matrix) {
  if (!matrix || matrix.length < 16) return { yaw: 0, pitch: 0, roll: 0 };

  const toDeg = (rad) => (rad * 180) / Math.PI;

  // Row-major extraction
  const m = matrix;

  // Pitch (X rotation)
  const sinPitch = -m[9];
  const pitch = toDeg(Math.asin(Math.max(-1, Math.min(1, sinPitch))));

  // Yaw (Y rotation)
  const cosP = Math.cos(Math.asin(sinPitch));
  const yaw = cosP > 0.001
    ? toDeg(Math.atan2(m[8], m[10]))
    : toDeg(Math.atan2(-m[2], m[0]));

  // Roll (Z rotation)
  const roll = cosP > 0.001
    ? toDeg(Math.atan2(m[1], m[5]))
    : 0;

  return {
    yaw: Number(yaw.toFixed(1)),
    pitch: Number(pitch.toFixed(1)),
    roll: Number(roll.toFixed(1)),
  };
}

/**
 * MediaPipe landmark indices for key points.
 * See: https://developers.google.com/mediapipe/solutions/vision/face_landmarker
 */
const LANDMARK = {
  NOSE_TIP: 4,
  LEFT_EYE_INNER: 133,
  RIGHT_EYE_INNER: 362,
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_OUTER: 263,
  CHIN: 152,
  FOREHEAD: 10,
  LEFT_CHEEK: 234,
  RIGHT_CHEEK: 454,
};

/**
 * Run face landmark detection on a video frame.
 *
 * @param {HTMLVideoElement} videoElement
 * @param {number} timestampMs
 * @returns {Promise<DetectionResult|null>}
 *
 * DetectionResult = {
 *   faceCount: number,
 *   noseTip: { x: number, y: number, z: number },   // normalized 0-1
 *   faceCenterX: number,                             // normalized 0-1
 *   faceCenterY: number,
 *   faceWidthNorm: number,                           // inter-eye distance (for depth estimate)
 *   headPose: { yaw: number, pitch: number, roll: number }, // degrees
 *   confidence: number,                              // 0-1
 *   landmarksRaw: object[],                          // raw landmark arrays per face
 * }
 */
export async function detectFrame(videoElement, timestampMs) {
  if (!videoElement || videoElement.readyState < 2) return null;

  // Attempt to load (no-op if already loaded or loading)
  const lm = await loadMediaPipe();
  if (!lm) return null; // Caller falls back to skin-pixel

  // Avoid duplicate processing of the same frame
  if (videoElement.currentTime === lastVideoTime) return null;
  lastVideoTime = videoElement.currentTime;

  try {
    const result = lm.detectForVideo(videoElement, timestampMs ?? performance.now());

    const faceCount = result.faceLandmarks?.length ?? 0;

    if (faceCount === 0) {
      return {
        faceCount: 0,
        noseTip: null,
        faceCenterX: 0.5,
        faceCenterY: 0.5,
        faceWidthNorm: 0,
        headPose: { yaw: 0, pitch: 0, roll: 0 },
        confidence: 0,
        landmarksRaw: [],
      };
    }

    // Primary face (first detected)
    const landmarks = result.faceLandmarks[0];

    const noseTip = landmarks[LANDMARK.NOSE_TIP];
    const leftEye = landmarks[LANDMARK.LEFT_EYE_OUTER];
    const rightEye = landmarks[LANDMARK.RIGHT_EYE_OUTER];
    const forehead = landmarks[LANDMARK.FOREHEAD];
    const chin = landmarks[LANDMARK.CHIN];

    // Face center = midpoint of nose and midpoint of eyes
    const eyeMidX = (leftEye.x + rightEye.x) / 2;
    const eyeMidY = (leftEye.y + rightEye.y) / 2;
    const faceCenterX = (noseTip.x + eyeMidX) / 2;
    const faceCenterY = (noseTip.y + eyeMidY) / 2;

    // Inter-eye distance in normalized coords (proxy for face scale / distance from camera)
    const faceWidthNorm = Math.abs(leftEye.x - rightEye.x);

    // Head pose from transformation matrix (most accurate method)
    let headPose = { yaw: 0, pitch: 0, roll: 0 };
    if (result.facialTransformationMatrixes?.length > 0) {
      const matrix = result.facialTransformationMatrixes[0].data;
      headPose = matrixToAngles(Array.from(matrix));
    } else {
      // Fallback: estimate yaw from eye symmetry and nose position
      const eyeCenter = (leftEye.x + rightEye.x) / 2;
      const noseDeltaX = noseTip.x - eyeCenter;
      // Rough yaw estimate: nose shifted left = looking right (mirrored), etc.
      headPose.yaw = Number((-noseDeltaX * 120).toFixed(1)); // heuristic scale
      // Pitch estimate from forehead-chin ratio relative to nose
      if (forehead && chin) {
        const faceHeight = Math.abs(chin.y - forehead.y);
        const noseFrac = (noseTip.y - forehead.y) / (faceHeight || 1);
        headPose.pitch = Number(((noseFrac - 0.5) * 60).toFixed(1));
      }
      // Roll: eye line tilt
      const eyeDeltaY = leftEye.y - rightEye.y;
      const eyeDeltaX = leftEye.x - rightEye.x;
      headPose.roll = Number((Math.atan2(eyeDeltaY, eyeDeltaX) * 180 / Math.PI).toFixed(1));
    }

    return {
      faceCount,
      noseTip: { x: noseTip.x, y: noseTip.y, z: noseTip.z ?? 0 },
      faceCenterX,
      faceCenterY,
      faceWidthNorm,
      headPose,
      confidence: 0.92,
      landmarksRaw: result.faceLandmarks,
    };
  } catch (err) {
    // Silently ignore single-frame errors
    return null;
  }
}

/**
 * Estimate approximate physical deviation in cm-equivalent units.
 *
 * This is a calibration-based estimate — NOT guaranteed to be exact centimeters.
 * The formula uses:
 *   - Calibrated center face position
 *   - Current face position
 *   - Inter-eye width (proxy for camera distance)
 *   - A configurable target threshold (HEAD_MOVEMENT_THRESHOLD_CM = 10)
 *
 * The result is labeled as "~Xcm equiv" in the UI to communicate that
 * this is an approximation, not a hardware-measured distance.
 *
 * @param {number} currentX - Current normalized face center X (0-1)
 * @param {number} centerX  - Calibrated center X (0-1)
 * @param {number} faceWidthNorm - Inter-eye distance in normalized coords (0-1)
 * @param {number} thresholdCm  - Target threshold in cm (default 10)
 * @returns {{ deviationCm: number, deviationNorm: number, confidence: string }}
 */
export function estimateDeviation(currentX, centerX, faceWidthNorm, thresholdCm = 10) {
  const deviationNorm = Math.abs(currentX - centerX);

  // Average adult inter-eye distance is ~6.3 cm.
  // If we know the inter-eye pixel/normalized distance, we can estimate scale.
  const INTER_EYE_CM = 6.3;

  let deviationCm = null;
  let confidence = 'low';

  if (faceWidthNorm > 0.05) {
    // px/cm scale factor derived from face geometry
    const cmPerNormUnit = INTER_EYE_CM / faceWidthNorm;
    deviationCm = Number((deviationNorm * cmPerNormUnit).toFixed(1));
    confidence = 'medium';
  }

  return {
    deviationNorm: Number(deviationNorm.toFixed(4)),
    deviationCm,   // null if not calculable
    confidence,
    thresholdCm,
  };
}

/**
 * Describe head orientation from yaw/pitch angles.
 * @param {{ yaw: number, pitch: number, roll: number }} headPose
 * @param {{ yawDeg: number, pitchDeg: number }} thresholds
 * @returns {string} orientation label
 */
export function classifyOrientation(headPose, thresholds = { yawDeg: 25, pitchDeg: 20 }) {
  if (!headPose) return 'HEAD_NORMAL';
  const { yaw, pitch } = headPose;

  if (Math.abs(yaw) > thresholds.yawDeg) {
    return yaw < 0 ? 'HEAD_LOOKING_LEFT' : 'HEAD_LOOKING_RIGHT';
  }
  if (pitch > thresholds.pitchDeg) return 'HEAD_LOOKING_DOWN';
  if (pitch < -thresholds.pitchDeg) return 'HEAD_LOOKING_UP';
  return 'HEAD_NORMAL';
}

/**
 * Reset the singleton (call when exam ends to free resources).
 */
export function destroyEstimator() {
  if (faceLandmarker) {
    try { faceLandmarker.close(); } catch (_) {}
    faceLandmarker = null;
  }
  isLoading = false;
  loadFailed = false;
  lastVideoTime = -1;
}
