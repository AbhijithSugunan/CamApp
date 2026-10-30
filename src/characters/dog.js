import { tintFace, enterFrame, ellipse, bsv } from './helpers.js';

export default {
  name: 'Puppy', emoji: '🐶', aura: '#FFD27A',
  draw(ctx, t, f, m, time) {
    tintFace(ctx, t.pts, '#c8884a', 0.2);
    enterFrame(ctx, f);
    const jaw = bsv(t.bs, 'jawOpen');
    // floppy ears: they swing against the head tilt like a pendulum
    for (const side of [-1, 1]) {
      const edge = side < 0 ? m.left : m.right;
      ctx.save();
      ctx.translate(edge + side * 0.08, m.top + 0.15);
      ctx.rotate(-f.angle * 0.6 + side * 0.15 + Math.sin(time * 2.5 + side) * 0.05);
      ctx.fillStyle = '#7b4a24';
      ctx.strokeStyle = '#3d220d';
      ctx.lineWidth = 0.035;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(side * 0.45, -0.05, side * 0.5, 0.75, side * 0.2, 0.95);
      ctx.bezierCurveTo(side * 0.02, 1.02, -side * 0.12, 0.6, 0, 0);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    // muzzle spots
    ctx.fillStyle = 'rgba(60,30,10,0.6)';
    for (const side of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        ellipse(ctx, m.noseX + side * (0.17 + k * 0.07), m.noseY + 0.12 + (k % 2) * 0.05, 0.016, 0.016);
        ctx.fill();
      }
    }
    // tongue
    if (jaw > 0.35) {
      const len = 0.15 + (jaw - 0.35) * 1.1 + Math.sin(time * 12) * 0.03 * jaw;
      const x = m.mouthX, y = m.mouthBotY - 0.02;
      ctx.fillStyle = '#ff5f8a';
      ctx.strokeStyle = '#b02a50';
      ctx.lineWidth = 0.025;
      ctx.beginPath();
      ctx.moveTo(x - 0.16, y);
      ctx.lineTo(x - 0.16, y + len * 0.7);
      ctx.quadraticCurveTo(x - 0.16, y + len, x, y + len);
      ctx.quadraticCurveTo(x + 0.16, y + len, x + 0.16, y + len * 0.7);
      ctx.lineTo(x + 0.16, y);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + 0.03); ctx.lineTo(x, y + len * 0.65); ctx.stroke();
    }
    // nose
    const g = ctx.createRadialGradient(m.noseX - 0.04, m.noseY - 0.05, 0.01, m.noseX, m.noseY, 0.18);
    g.addColorStop(0, '#555'); g.addColorStop(0.4, '#151515'); g.addColorStop(1, '#000');
    ctx.fillStyle = g;
    ellipse(ctx, m.noseX, m.noseY - 0.02, 0.17, 0.12); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ellipse(ctx, m.noseX - 0.06, m.noseY - 0.07, 0.04, 0.022); ctx.fill();
    ctx.restore();
  },
};
