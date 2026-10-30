import { tintFace, enterFrame, glow, facePath, bsv } from './helpers.js';

export default {
  name: 'Lil Devil', emoji: '😈', aura: '#FF4D4D',
  draw(ctx, t, f, m, time) {
    // fiery outer glow
    ctx.save();
    ctx.shadowColor = `rgba(255,60,0,${0.6 + Math.sin(time * 4) * 0.2})`;
    ctx.shadowBlur = f.s * 0.6;
    ctx.strokeStyle = 'rgba(255,80,0,0.25)';
    ctx.lineWidth = f.s * 0.05;
    facePath(ctx, t.pts);
    ctx.stroke();
    ctx.restore();
    tintFace(ctx, t.pts, '#ff2a2a', 0.75);

    enterFrame(ctx, f);
    // horns
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 0.42, m.top + 0.12);
      const g = ctx.createLinearGradient(0, 0.1, side * 0.3, -0.6);
      g.addColorStop(0, '#7a0000');
      g.addColorStop(1, '#ff6a3d');
      ctx.fillStyle = g;
      ctx.strokeStyle = '#3a0000';
      ctx.lineWidth = 0.03;
      ctx.beginPath();
      ctx.moveTo(-0.15 * side, 0.05);
      ctx.quadraticCurveTo(side * 0.05, -0.35, side * 0.32, -0.62);
      ctx.quadraticCurveTo(side * 0.12, -0.2, side * 0.17, 0.05);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    // angry brows
    const brow = bsv(t.bs, 'browDownLeft') + bsv(t.bs, 'browDownRight');
    ctx.strokeStyle = '#2a0000';
    ctx.lineWidth = 0.07;
    ctx.lineCap = 'round';
    for (const [x, y, side] of [[m.eyeLX, m.eyeLY, -1], [m.eyeRX, m.eyeRY, 1]]) {
      ctx.beginPath();
      ctx.moveTo(x - side * 0.18, y - 0.25 - brow * 0.02);
      ctx.lineTo(x + side * 0.18, y - 0.17);
      ctx.stroke();
      glow(ctx, x, y, 0.16, 'rgba(255,220,0,0.35)');
    }
    // little goatee
    ctx.fillStyle = '#2a0000';
    ctx.beginPath();
    ctx.moveTo(-0.1, m.chin - 0.12);
    ctx.lineTo(0.1, m.chin - 0.12);
    ctx.lineTo(0, m.chin + 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },
};
