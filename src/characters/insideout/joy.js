import { tintFace, enterFrame, glow } from '../helpers.js';

export default {
  name: 'Joy', emoji: '😄', aura: '#FFE45C',
  draw(ctx, t, f, m, time) {
    tintFace(ctx, t.pts, '#ffd84a', 0.8);
    tintFace(ctx, t.pts, 'rgba(255,250,200,0.35)', 1, 'soft-light');
    enterFrame(ctx, f);
    // warm glow around the head
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    glow(ctx, 0, 0.2, 1.7 + Math.sin(time * 3) * 0.05, 'rgba(255,235,140,0.35)');
    ctx.restore();
    // spiky blue pixie hair
    const w = (m.right - m.left) / 2 + 0.08;
    const cy = m.top + 0.4, ry = 0.72;
    const n = 9;
    ctx.fillStyle = '#2a6fdb';
    ctx.strokeStyle = '#123f8f';
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.moveTo(m.left - 0.02, cy + 0.15);
    for (let i = 0; i <= n; i++) {
      const a = Math.PI + (i / n) * Math.PI;
      const spike = i % 2 ? 0.22 + Math.sin(time * 4 + i) * 0.02 : 0;
      ctx.lineTo(Math.cos(a) * (w + spike * 0.6), cy + Math.sin(a) * (ry + spike));
    }
    ctx.lineTo(m.right + 0.02, cy + 0.15);
    // fringe edge back across the forehead
    ctx.quadraticCurveTo(m.right - 0.25, m.top + 0.1, 0.25, m.top + 0.22);
    ctx.lineTo(0.05, m.top + 0.08);
    ctx.lineTo(-0.15, m.top + 0.24);
    ctx.quadraticCurveTo(m.left + 0.25, m.top + 0.12, m.left - 0.02, cy + 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // twinkles by the eyes
    ctx.fillStyle = '#fff';
    for (const [x, y, k] of [[m.eyeLX - 0.3, m.eyeLY - 0.2, 0], [m.eyeRX + 0.3, m.eyeRY - 0.2, 2]]) {
      const s = 0.05 * (0.6 + 0.4 * Math.sin(time * 6 + k));
      ctx.beginPath();
      ctx.moveTo(x, y - s * 2); ctx.lineTo(x + s * 0.5, y); ctx.lineTo(x, y + s * 2); ctx.lineTo(x - s * 0.5, y);
      ctx.closePath();
      ctx.moveTo(x - s * 2, y); ctx.lineTo(x, y + s * 0.5); ctx.lineTo(x + s * 2, y); ctx.lineTo(x, y - s * 0.5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  },
};
