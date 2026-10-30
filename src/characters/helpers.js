// Landmark indices (MediaPipe 478-point face mesh) and drawing helpers.
// Screen is mirrored, so the subject's LEFT side (263, 362, 454...) appears on screen-left.

export const FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
  152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
export const EYE_SCREEN_LEFT = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];
export const EYE_SCREEN_RIGHT = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
export const LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
export const LIPS_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191];

export const L = {
  forehead: 10, chin: 152, noseTip: 1, noseBottom: 2, betweenEyes: 168,
  cheekScreenLeft: 454, cheekScreenRight: 234,
  mouthScreenLeft: 291, mouthScreenRight: 61, lipTop: 0, lipBottom: 17, innerTop: 13, innerBottom: 14,
  browScreenLeft: 334, browScreenRight: 105,
};

// Local face frame: origin between the eyes, x to screen-right along the eye line, y down,
// 1 unit = outer-eye-corner distance. Lets characters be drawn once and follow tilt/scale.
export function computeFrame(pts, f = {}) {
  const ax = pts[263 * 2], ay = pts[263 * 2 + 1];
  const bx = pts[33 * 2], by = pts[33 * 2 + 1];
  f.cx = pts[168 * 2];
  f.cy = pts[168 * 2 + 1];
  f.s = Math.hypot(bx - ax, by - ay) || 1;
  f.angle = Math.atan2(by - ay, bx - ax);
  f.cos = Math.cos(f.angle);
  f.sin = Math.sin(f.angle);
  return f;
}

// screen point -> local frame
export function local(pts, i, f, out) {
  const dx = pts[i * 2] - f.cx, dy = pts[i * 2 + 1] - f.cy;
  out.x = (dx * f.cos + dy * f.sin) / f.s;
  out.y = (-dx * f.sin + dy * f.cos) / f.s;
  return out;
}

// Local measurements every character can use (computed once per face per frame).
export function measure(pts, f) {
  const p = { x: 0, y: 0 };
  const m = f.m || (f.m = {});
  m.top = local(pts, L.forehead, f, p).y;
  m.chin = local(pts, L.chin, f, p).y;
  m.left = local(pts, L.cheekScreenLeft, f, p).x;
  m.right = local(pts, L.cheekScreenRight, f, p).x;
  local(pts, L.noseTip, f, p); m.noseX = p.x; m.noseY = p.y;
  local(pts, L.innerTop, f, p); m.mouthX = p.x; m.mouthTopY = p.y;
  m.mouthBotY = local(pts, L.innerBottom, f, p).y;
  m.lipTopY = local(pts, L.lipTop, f, p).y;
  m.mouthL = local(pts, L.mouthScreenLeft, f, p).x;
  m.mouthR = local(pts, L.mouthScreenRight, f, p).x;
  const e1 = local(pts, 263, f, { x: 0, y: 0 }), e2 = local(pts, 362, f, { x: 0, y: 0 });
  m.eyeLX = (e1.x + e2.x) / 2; m.eyeLY = (e1.y + e2.y) / 2;
  const e3 = local(pts, 33, f, { x: 0, y: 0 }), e4 = local(pts, 133, f, { x: 0, y: 0 });
  m.eyeRX = (e3.x + e4.x) / 2; m.eyeRY = (e3.y + e4.y) / 2;
  // yaw proxy: nose offset relative to cheek midpoint (-1..1)
  m.yaw = (m.noseX - (m.left + m.right) / 2) / Math.max(0.1, (m.right - m.left) / 2);
  return m;
}

export function polyPath(ctx, pts, idx) {
  ctx.beginPath();
  ctx.moveTo(pts[idx[0] * 2], pts[idx[0] * 2 + 1]);
  for (let k = 1; k < idx.length; k++) ctx.lineTo(pts[idx[k] * 2], pts[idx[k] * 2 + 1]);
  ctx.closePath();
}

// The mesh stops mid-forehead; stretch the upper oval toward the hairline so tints cover it.
const ovalXY = new Float32Array(FACE_OVAL.length * 2);
function extendedOval(pts) {
  const cx = pts[168 * 2], cy = pts[168 * 2 + 1];
  let ux = cx - pts[152 * 2], uy = cy - pts[152 * 2 + 1];
  const ul = Math.hypot(ux, uy) || 1;
  ux /= ul; uy /= ul;
  for (let k = 0; k < FACE_OVAL.length; k++) {
    const i = FACE_OVAL[k];
    const vx = pts[i * 2] - cx, vy = pts[i * 2 + 1] - cy;
    const up = (vx * ux + vy * uy) / (Math.hypot(vx, vy) || 1);
    const push = up > 0 ? up * up * 0.3 : 0;
    ovalXY[k * 2] = pts[i * 2] + vx * push;
    ovalXY[k * 2 + 1] = pts[i * 2 + 1] + vy * push;
  }
  return ovalXY;
}

export function facePath(ctx, pts) {
  const o = extendedOval(pts);
  ctx.beginPath();
  ctx.moveTo(o[0], o[1]);
  for (let k = 2; k < o.length; k += 2) ctx.lineTo(o[k], o[k + 1]);
  ctx.closePath();
}

// Recolor skin while keeping its shading ('color' blend keeps luminance).
export function tintFace(ctx, pts, color, alpha = 0.7, mode = 'color') {
  ctx.save();
  ctx.globalCompositeOperation = mode;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  facePath(ctx, pts);
  ctx.fill();
  ctx.restore();
}

// Enter the local face frame (remember to ctx.restore()).
export function enterFrame(ctx, f) {
  ctx.save();
  ctx.translate(f.cx, f.cy);
  ctx.rotate(f.angle);
  ctx.scale(f.s, f.s);
}

export function ellipse(ctx, x, y, rx, ry, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(rx, 0.0001), Math.max(ry, 0.0001), rot, 0, Math.PI * 2);
}

export function glow(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export const bsv = (bs, name) => bs[name] || 0;
