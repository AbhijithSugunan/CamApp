// Keeps a stable identity (and character) per person across frames, and smooths landmarks.
import { pickCharacter } from './characters/index.js';

const NUM_POINTS = 478;
const KEEP_MS = 1500; // remember a lost face this long (same person re-entering keeps their character)
const SHOW_MS = 250;  // keep drawing through brief detection dropouts
const ANCHOR = 168;   // point between the eyes

let nextId = 1;

export class Tracker {
  constructor() {
    this.tracks = [];
    this.scratch = new Float32Array(NUM_POINTS * 2);
  }

  // map: cover-crop mapping from normalized video coords to mirrored screen pixels
  // faces: [{ lms, bs, ox, oy, sx, sy }] from detector.detect()
  update(faces, map, now) {
    for (const t of this.tracks) t.matched = false;

    for (const face of faces) {
      const { lms, ox, oy, sx, sy } = face;
      if (lms.length < NUM_POINTS) continue;
      const pts = this.scratch;
      for (let i = 0; i < NUM_POINTS; i++) {
        const p = lms[i];
        const vx = (ox + p.x * sx) * map.vw, vy = (oy + p.y * sy) * map.vh;
        pts[i * 2] = map.W - ((vx - map.sx) / map.sw) * map.W;
        pts[i * 2 + 1] = ((vy - map.sy) / map.sh) * map.H;
      }
      const cx = pts[ANCHOR * 2], cy = pts[ANCHOR * 2 + 1];
      const size = Math.hypot(pts[33 * 2] - pts[263 * 2], pts[33 * 2 + 1] - pts[263 * 2 + 1]);

      // nearest unmatched track within reach
      let best = null, bestD = size * 1.5;
      for (const t of this.tracks) {
        if (t.matched) continue;
        const d = Math.hypot(t.cx - cx, t.cy - cy);
        if (d < bestD) { bestD = d; best = t; }
      }
      if (!best) {
        best = { id: nextId++, pts: new Float32Array(pts), bs: {}, cx, cy, size, born: now };
        best.character = pickCharacter(this.tracks);
        this.tracks.push(best);
      } else {
        // adaptive EMA: follow fast motion quickly, damp jitter when still
        const move = bestD / Math.max(size, 1);
        const a = Math.min(1, 0.45 + move * 3);
        const tp = best.pts;
        for (let i = 0; i < tp.length; i++) tp[i] += (pts[i] - tp[i]) * a;
      }
      best.matched = true;
      best.cx = cx; best.cy = cy; best.size = size;
      best.lastSeen = now;
      readBlendshapes(face.bs, best.bs);
    }

    // drop long-lost tracks
    for (let i = this.tracks.length - 1; i >= 0; i--) {
      const t = this.tracks[i];
      if (now - t.lastSeen > KEEP_MS) this.tracks.splice(i, 1);
    }
  }

  visible(now) {
    return this.tracks.filter((t) => now - t.lastSeen < SHOW_MS);
  }
}

const SMOOTH = 0.5;
function readBlendshapes(entry, bs) {
  const cats = entry?.categories;
  if (!cats) return;
  for (const c of cats) {
    const prev = bs[c.categoryName];
    bs[c.categoryName] = prev === undefined ? c.score : prev + (c.score - prev) * SMOOTH;
  }
}
