import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const BASE = import.meta.env.BASE_URL;

async function createLandmarker(vision, delegate, maxFaces) {
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: `${BASE}models/face_landmarker.task`, delegate },
    runningMode: 'VIDEO',
    numFaces: maxFaces,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputFaceBlendshapes: true,
  });
}

// Face detector served entirely from local files (offline-safe).
// MediaPipe's face detector is short-range, so people further from the camera are missed.
// Besides the full frame we also run a second landmarker on a zoomed center square crop
// (~1.8x larger faces on a 16:9 camera) and merge the results.
export async function createDetector({ maxFaces = 6, far = true } = {}) {
  const vision = await FilesetResolver.forVisionTasks(`${BASE}mediapipe/wasm`);
  let delegate = 'GPU';
  let full;
  try {
    full = await createLandmarker(vision, 'GPU', maxFaces);
  } catch (err) {
    console.warn('GPU delegate failed, falling back to CPU', err);
    delegate = 'CPU';
    full = await createLandmarker(vision, 'CPU', maxFaces);
  }
  const zoom = far ? await createLandmarker(vision, delegate, maxFaces) : null;
  const crop = zoom ? document.createElement('canvas') : null;
  const cropCtx = crop?.getContext('2d', { willReadFrequently: false });
  const faces = [];

  // Returns [{ lms, bs, ox, oy, sx, sy }]: video-normalized point = (ox + lms.x*sx, oy + lms.y*sy)
  function detect(video, now) {
    faces.length = 0;
    const r = full.detectForVideo(video, now);
    for (let i = 0; i < r.faceLandmarks.length; i++) {
      faces.push({ lms: r.faceLandmarks[i], bs: r.faceBlendshapes?.[i], ox: 0, oy: 0, sx: 1, sy: 1 });
    }
    if (!zoom) return faces;

    const vw = video.videoWidth, vh = video.videoHeight;
    const side = Math.min(vw, vh);
    if (side >= Math.max(vw, vh) * 0.9) return faces; // camera is ~square: zoom would not help
    const x0 = (vw - side) / 2, y0 = (vh - side) / 2;
    if (crop.width !== side) { crop.width = side; crop.height = side; }
    cropCtx.drawImage(video, x0, y0, side, side, 0, 0, side, side);
    const z = zoom.detectForVideo(crop, now);
    const nFull = faces.length;
    for (let i = 0; i < z.faceLandmarks.length; i++) {
      const lms = z.faceLandmarks[i];
      const ox = x0 / vw, oy = y0 / vh, sx = side / vw, sy = side / vh;
      // skip faces the full-frame pass already found
      const cx = ox + lms[168].x * sx, cy = oy + lms[168].y * sy;
      const eye = Math.abs(lms[33].x - lms[263].x) * sx;
      let dup = false;
      for (let k = 0; k < nFull; k++) {
        const p = faces[k].lms[168];
        if (Math.hypot(p.x - cx, (p.y - cy) * (vh / vw)) < eye) { dup = true; break; }
      }
      if (!dup) faces.push({ lms, bs: z.faceBlendshapes?.[i], ox, oy, sx, sy });
    }
    return faces;
  }

  return { detect, delegate, far: !!zoom };
}
