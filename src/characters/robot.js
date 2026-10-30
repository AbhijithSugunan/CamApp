import { tintFace, enterFrame, ellipse, glow, bsv } from './helpers.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
}

export default {
  name: 'Robot', emoji: '🤖', aura: '#6FE7FF',
  draw(ctx, t, f, m, time) {
    tintFace(ctx, t.pts, '#8fb3c9', 0.9);
    tintFace(ctx, t.pts, '#cfe6f5', 0.35, 'overlay');
    enterFrame(ctx, f);
    // antenna with blinking light
    ctx.strokeStyle = '#9aa7b0';
    ctx.lineWidth = 0.05;
    ctx.beginPath(); ctx.moveTo(0, m.top + 0.02); ctx.lineTo(0, m.top - 0.45); ctx.stroke();
    const on = Math.sin(time * 6) > 0;
    if (on) glow(ctx, 0, m.top - 0.5, 0.3, 'rgba(255,60,60,0.8)');
    ctx.fillStyle = on ? '#ff4040' : '#7a1d1d';
    ellipse(ctx, 0, m.top - 0.5, 0.08, 0.08); ctx.fill();
    // bolts on the sides
    for (const x of [m.left + 0.04, m.right - 0.04]) {
      ctx.fillStyle = '#c0c8cf';
      ctx.strokeStyle = '#5b646b';
      ctx.lineWidth = 0.025;
      ellipse(ctx, x, 0.35, 0.09, 0.09); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 0.05, 0.35); ctx.lineTo(x + 0.05, 0.35); ctx.stroke();
    }
    // LED visor eyes
    const eyes = [[m.eyeLX, m.eyeLY, bsv(t.bs, 'eyeBlinkLeft')], [m.eyeRX, m.eyeRY, bsv(t.bs, 'eyeBlinkRight')]];
    for (const [x, y, b] of eyes) {
      const h = 0.04 + 0.16 * (1 - Math.min(1, b * 1.2));
      ctx.fillStyle = '#0b1a22';
      roundRect(ctx, x - 0.25, y - 0.14, 0.5, 0.28, 0.06); ctx.fill();
      glow(ctx, x, y, 0.35, 'rgba(80,230,255,0.45)');
      ctx.fillStyle = '#5ff2ff';
      roundRect(ctx, x - 0.19, y - h / 2, 0.38, h, 0.04); ctx.fill();
      // scanning line
      const sx = x - 0.19 + ((time * 0.8) % 1) * 0.38;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(sx - 0.015, y - h / 2, 0.03, h);
    }
    // speaker-grille mouth with equalizer bars driven by jaw
    const jaw = bsv(t.bs, 'jawOpen');
    const w = Math.max(0.5, (m.mouthR - m.mouthL) * 1.15);
    const cx = (m.mouthL + m.mouthR) / 2;
    const top = m.lipTopY - 0.04;
    const h = 0.16 + jaw * 0.45;
    ctx.fillStyle = '#1b2329';
    ctx.strokeStyle = '#9aa7b0';
    ctx.lineWidth = 0.03;
    roundRect(ctx, cx - w / 2, top, w, h, 0.05); ctx.fill(); ctx.stroke();
    const bars = 7;
    for (let i = 0; i < bars; i++) {
      const bh = h * (0.25 + 0.7 * Math.abs(Math.sin(time * 9 + i * 1.7)) * (0.3 + jaw));
      ctx.fillStyle = `hsl(${180 + i * 12},100%,60%)`;
      ctx.fillRect(cx - w / 2 + 0.04 + (i * (w - 0.08)) / bars, top + h - bh - 0.02, (w - 0.08) / bars - 0.02, bh);
    }
    ctx.restore();
  },
};
