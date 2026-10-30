import { tintFace, enterFrame } from '../helpers.js';

// fixed pseudo-random spike layout so the hair looks messy but stable
const SPIKES = Array.from({ length: 15 }, (_, i) => ({
  len: 0.25 + ((i * 37) % 11) / 30,
  tilt: (((i * 53) % 7) - 3) * 0.08,
}));

export default {
  name: 'Anxiety', emoji: '😬', aura: '#FF9A3C',
  draw(ctx, t, f, m, time) {
    tintFace(ctx, t.pts, '#ff8a2b', 0.8);
    enterFrame(ctx, f);
    // constant nervous jitter
    ctx.translate(Math.sin(time * 47) * 0.01, Math.cos(time * 53) * 0.008);
    // wild frizzy hair
    const w = (m.right - m.left) / 2 + 0.05;
    const cy = m.top + 0.4, ry = 0.62;
    ctx.fillStyle = '#e0561a';
    ctx.strokeStyle = '#8f2f08';
    ctx.lineWidth = 0.025;
    ctx.beginPath();
    ctx.moveTo(m.left, cy + 0.1);
    const n = SPIKES.length;
    for (let i = 0; i < n; i++) {
      const a0 = Math.PI + (i / n) * Math.PI, a1 = Math.PI + ((i + 0.5) / n) * Math.PI, a2 = Math.PI + ((i + 1) / n) * Math.PI;
      const s = SPIKES[i];
      const jit = Math.sin(time * 20 + i * 3) * 0.03;
      const len = s.len + jit;
      ctx.lineTo(Math.cos(a0) * w, cy + Math.sin(a0) * ry);
      ctx.lineTo(Math.cos(a1 + s.tilt) * (w + len), cy + Math.sin(a1 + s.tilt) * (ry + len));
      ctx.lineTo(Math.cos(a2) * w, cy + Math.sin(a2) * ry);
    }
    ctx.lineTo(m.right, cy + 0.1);
    ctx.quadraticCurveTo(0, m.top + 0.05, m.left, cy + 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // tired eye bags + worried brows
    ctx.strokeStyle = 'rgba(120,40,0,0.7)';
    ctx.lineWidth = 0.025;
    ctx.lineCap = 'round';
    for (const [x, y, side] of [[m.eyeLX, m.eyeLY, -1], [m.eyeRX, m.eyeRY, 1]]) {
      ctx.beginPath();
      ctx.arc(x, y + 0.02, 0.17, 0.25 * Math.PI, 0.75 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y + 0.06, 0.15, 0.3 * Math.PI, 0.7 * Math.PI);
      ctx.stroke();
    }
    ctx.strokeStyle = '#7a2a05';
    ctx.lineWidth = 0.05;
    ctx.beginPath();
    ctx.moveTo(m.eyeLX - 0.2, m.eyeLY - 0.22);
    ctx.lineTo(m.eyeLX + 0.15, m.eyeLY - 0.32);
    ctx.moveTo(m.eyeRX + 0.2, m.eyeRY - 0.22);
    ctx.lineTo(m.eyeRX - 0.15, m.eyeRY - 0.32);
    ctx.stroke();
    ctx.restore();
  },
};
