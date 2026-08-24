import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

let loadPromise: Promise<void> | null = null;

/** Loads the TinyFaceDetector, 68-point landmark, and recognition (descriptor) nets. Safe to call multiple times. */
export function loadFaceModels(): Promise<void> {
  if (!loadPromise) {
    loadPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]).then(() => undefined);
  }
  return loadPromise;
}

export function areModelsLoaded(): boolean {
  return (
    faceapi.nets.tinyFaceDetector.isLoaded &&
    faceapi.nets.faceLandmark68Net.isLoaded &&
    faceapi.nets.faceRecognitionNet.isLoaded
  );
}

const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.5,
});

export type FullDetection = faceapi.WithFaceDescriptor<
  faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
>;

/** Runs detection + 68-point landmarks + 128-d descriptor on a single video/image frame. */
export async function detectFace(
  input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement,
): Promise<FullDetection | undefined> {
  return faceapi
    .detectSingleFace(input, DETECTOR_OPTIONS)
    .withFaceLandmarks()
    .withFaceDescriptor();
}

/** Euclidean distance between two 128-d descriptors. Lower = more similar. Typical match threshold ~0.5-0.6. */
export function descriptorDistance(a: Float32Array | number[], b: Float32Array | number[]): number {
  return faceapi.euclideanDistance(a, b);
}

export const MATCH_THRESHOLD = 0.55;

export interface EnrolledFace {
  id: string;
  descriptor: number[];
}

/** Finds the closest enrolled face to a live descriptor. Returns null if nothing is within threshold. */
export function findBestMatch(
  liveDescriptor: Float32Array,
  enrolled: EnrolledFace[],
): { id: string; distance: number } | null {
  let best: { id: string; distance: number } | null = null;
  for (const e of enrolled) {
    const distance = descriptorDistance(liveDescriptor, e.descriptor);
    if (!best || distance < best.distance) {
      best = { id: e.id, distance };
    }
  }
  if (best && best.distance <= MATCH_THRESHOLD) return best;
  return null;
}

/**
 * Real geometric facial ratio computed from the 68-point landmark set:
 * inter-ocular distance / face height (jaw-to-brow span).
 * This is the same "scale-invariant ratio" concept the original coursework used,
 * now derived from actual detected landmarks instead of a random number.
 */
export function computeGeometricRatio(landmarks: faceapi.FaceLandmarks68): number {
  const pts = landmarks.positions;
  const leftEyeOuter = pts[36];
  const rightEyeOuter = pts[45];
  const interOcular = Math.hypot(rightEyeOuter.x - leftEyeOuter.x, rightEyeOuter.y - leftEyeOuter.y);

  const chin = pts[8];
  const browCenter = pts[27];
  const faceHeight = Math.hypot(chin.x - browCenter.x, chin.y - browCenter.y);

  if (faceHeight === 0) return 0;
  return interOcular / faceHeight;
}
