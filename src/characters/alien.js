import { tintFace, enterFrame, ellipse, glow, bsv } from './helpers.js';

export default {
  name: 'Alien', emoji: '👽', aura: '#7CFF6B',
  draw(ctx, t, f, m, time) {
    tintFace(ctx, t.pts, '#38e83a', 0.85);
    tintFace(ctx, t.pts, 'rgba(120,255,120,0.35)', 1, 'soft-light');

    enterFrame(ctx, f);
    const brow = bsv(t.bs, 'browInnerUp');
    // antennae
    for (const side of [-1, 1]) {
      const bx = side * 0.28, by = m.top + 0.05;
      const wob = Math.sin(time * 3.2 + side) * 0.12 + side * brow * 0.25;
      const tx = side * 0.6 + wob, ty = m.top - 0.85 - brow * 0.3;
      ctx.strokeStyle = '#2fbf2f';
      ctx.lineWidth = 0.07;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(side * 0.25 + wob * 0.5, ty + 0.35, tx, ty);
      ctx.stroke();
      const pulse = 0.18 + Math.sin(time * 5 + side) * 0.04;
      glow(ctx, tx, ty, pulse * 2.2, 'rgba(180,255,120,0.8)');
      ctx.fillStyle = '#d9ff4a';
      ellipse(ctx, tx, ty, pulse * 0.7, pulse * 0.7);
      ctx.fill();
    }
    // big almond eyes
    const eyes = [
      [m.eyeLX, m.eyeLY, bsv(t.bs, 'eyeBlinkLeft'), -1],
      [m.eyeRX, m.eyeRY, bsv(t.bs, 'eyeBlinkRight'), 1],
    ];
    for (const [x, y, blink, side] of eyes) {
      const open = 1 - Math.min(1, blink * 1.1);
      const rx = 0.3, ry = 0.17 * (0.12 + open * 0.88);
      const g = ctx.createRadialGradient(x, y - 0.05, 0.02, x, y, rx);
      g.addColorStop(0, '#2b1240');
      g.addColorStop(1, '#000');
      ctx.fillStyle = g;
      ellipse(ctx, x + side * 0.03, y - 0.02, rx, ry, side * -0.38);
      ctx.fill();
      if (open > 0.3) {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ellipse(ctx, x - side * 0.08, y - 0.07, 0.05, 0.035);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ellipse(ctx, x + side * 0.1, y + 0.03, 0.025, 0.02);
        ctx.fill();
      }
    }
    ctx.restore();
  },
};
