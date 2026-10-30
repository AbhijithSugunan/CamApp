import { tintFace, enterFrame, LIPS_OUTER, LIPS_INNER, bsv } from '../helpers.js';

function lipPath(ctx, pts) {
  ctx.beginPath();
  for (const idx of [LIPS_OUTER, LIPS_INNER]) {
    ctx.moveTo(pts[idx[0] * 2], pts[idx[0] * 2 + 1]);
    for (let k = 1; k < idx.length; k++) ctx.lineTo(pts[idx[k] * 2], pts[idx[k] * 2 + 1]);
    ctx.closePath();
  }
}

export default {
  name: 'Disgust', emoji: '🤢', aura: '#9BE564',
  draw(ctx, t, f, m, time) {
    tintFace(ctx, t.pts, '#7fd14e', 0.8);
    // purple lipstick
    ctx.save();
    ctx.globalCompositeOperation = 'color';
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#8a2be2';
    lipPath(ctx, t.pts);
    ctx.fill('evenodd');
    ctx.restore();

    enterFrame(ctx, f);
    // long dark-green hair with a side-swept fringe
    ctx.fillStyle = '#2f5f1f';
    ctx.strokeStyle = '#173510';
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.moveTo(m.left - 0.12, m.chin + 0.35);
    ctx.bezierCurveTo(m.left - 0.4, m.top, m.left, m.top - 0.6, 0.1, m.top - 0.5);
    ctx.bezierCurveTo(m.right + 0.1, m.top - 0.5, m.right + 0.4, m.top, m.right + 0.12, m.chin + 0.35);
    ctx.quadraticCurveTo(m.right + 0.05, m.chin + 0.45, m.right - 0.02, m.chin + 0.2);
    ctx.quadraticCurveTo(m.right + 0.05, m.top + 0.4, m.right - 0.15, m.top + 0.2);
    // swoop across the forehead
    ctx.bezierCurveTo(0.2, m.top + 0.05, -0.1, m.top + 0.45, m.left + 0.15, m.top + 0.4);
    ctx.quadraticCurveTo(m.left - 0.02, m.top + 0.6, m.left + 0.02, m.chin + 0.2);
    ctx.quadraticCurveTo(m.left - 0.05, m.chin + 0.45, m.left - 0.12, m.chin + 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // long eyelashes
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 0.03;
    ctx.lineCap = 'round';
    for (const [x, y, side, b] of [[m.eyeLX, m.eyeLY, -1, bsv(t.bs, 'eyeBlinkLeft')], [m.eyeRX, m.eyeRY, 1, bsv(t.bs, 'eyeBlinkRight')]]) {
      const lift = 0.07 * (1 - b);
      for (let i = 0; i < 3; i++) {
        const bx = x + side * (0.08 + i * 0.06), by = y - lift - 0.02 + i * 0.015;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + side * 0.1, by - 0.1 + i * 0.02);
        ctx.stroke();
      }
    }
    // one sassy raised brow
    ctx.lineWidth = 0.045;
    ctx.beginPath();
    ctx.moveTo(m.eyeRX - 0.18, m.eyeRY - 0.26);
    ctx.quadraticCurveTo(m.eyeRX, m.eyeRY - 0.45 - Math.sin(time * 2) * 0.02, m.eyeRX + 0.2, m.eyeRY - 0.3);
    ctx.stroke();
    ctx.restore();
  },
};
