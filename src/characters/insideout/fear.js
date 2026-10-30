import { tintFace, enterFrame, ellipse, bsv } from '../helpers.js';

export default {
  name: 'Fear', emoji: '😱', aura: '#C39BFF', tagY: 0.6,
  draw(ctx, t, f, m, time) {
    tintFace(ctx, t.pts, '#a77fe0', 0.8);
    enterFrame(ctx, f);
    const brow = bsv(t.bs, 'browInnerUp');
    // the single curly hair strand
    ctx.strokeStyle = '#3b1f66';
    ctx.lineWidth = 0.05;
    ctx.lineCap = 'round';
    const wob = Math.sin(time * 5) * 0.05;
    ctx.beginPath();
    ctx.moveTo(0, m.top + 0.03);
    ctx.bezierCurveTo(-0.05, m.top - 0.3, 0.25 + wob, m.top - 0.45, 0.2 + wob, m.top - 0.25);
    ctx.bezierCurveTo(0.16 + wob, m.top - 0.15, 0.05, m.top - 0.25, 0.1, m.top - 0.32);
    ctx.stroke();
    // bushy brows, jump up when you look surprised
    ctx.fillStyle = '#3b1f66';
    for (const [x, y, side] of [[m.eyeLX, m.eyeLY, -1], [m.eyeRX, m.eyeRY, 1]]) {
      ellipse(ctx, x, y - 0.3 - brow * 0.12, 0.2, 0.06, side * 0.25);
      ctx.fill();
    }
    // sweat drop
    const p = (time * 0.6) % 1;
    const sx = m.right - 0.15, sy = m.top + 0.35 + p * 0.3;
    ctx.globalAlpha = 1 - p * 0.8;
    ctx.fillStyle = '#d9f1ff';
    ctx.strokeStyle = '#6aa8d8';
    ctx.lineWidth = 0.02;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 0.1);
    ctx.quadraticCurveTo(sx + 0.07, sy, sx, sy + 0.04);
    ctx.quadraticCurveTo(sx - 0.07, sy, sx, sy - 0.1);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
    // polka-dot bow tie
    const y = m.chin + 0.14;
    ctx.fillStyle = '#8b1e3f';
    ctx.strokeStyle = '#4a0c20';
    ctx.lineWidth = 0.025;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(side * 0.3, y - 0.14);
      ctx.lineTo(side * 0.3, y + 0.14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ellipse(ctx, 0, y, 0.06, 0.07);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffd1dc';
    for (const [dx, dy] of [[-0.2, -0.04], [-0.14, 0.06], [0.2, -0.04], [0.14, 0.06]]) {
      ellipse(ctx, dx, y + dy, 0.02, 0.02);
      ctx.fill();
    }
    ctx.restore();
  },
};
