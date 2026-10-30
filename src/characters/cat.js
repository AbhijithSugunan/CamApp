import { tintFace, enterFrame, ellipse, bsv } from './helpers.js';

export default {
  name: 'Kitty', emoji: '🐱', aura: '#FFB6E1',
  draw(ctx, t, f, m, time) {
    tintFace(ctx, t.pts, '#ffb070', 0.25);
    enterFrame(ctx, f);
    const perk = 1 + bsv(t.bs, 'browInnerUp') * 0.25;
    const twitch = Math.max(0, Math.sin(time * 1.3)) ** 30 * 0.25;
    // ears
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 0.5, m.top + 0.1);
      ctx.rotate(side * (0.3 + (side > 0 ? twitch : 0)));
      ctx.scale(perk, perk);
      ctx.fillStyle = '#f39c4a';
      ctx.strokeStyle = '#7a3e10';
      ctx.lineWidth = 0.035;
      ctx.beginPath();
      ctx.moveTo(-0.32, 0.12); ctx.lineTo(0, -0.62); ctx.lineTo(0.32, 0.12); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ff9fc4';
      ctx.beginPath();
      ctx.moveTo(-0.18, 0.06); ctx.lineTo(0, -0.42); ctx.lineTo(0.18, 0.06); ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // blush
    ctx.fillStyle = 'rgba(255,110,160,0.35)';
    ellipse(ctx, m.eyeLX - 0.05, m.noseY + 0.05, 0.17, 0.1); ctx.fill();
    ellipse(ctx, m.eyeRX + 0.05, m.noseY + 0.05, 0.17, 0.1); ctx.fill();
    // nose
    const nx = m.noseX, ny = m.noseY;
    ctx.fillStyle = '#ff6fa3';
    ctx.strokeStyle = '#5a2030';
    ctx.lineWidth = 0.025;
    ctx.beginPath();
    ctx.moveTo(nx - 0.1, ny - 0.04); ctx.lineTo(nx + 0.1, ny - 0.04); ctx.lineTo(nx, ny + 0.07); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // whiskers
    ctx.strokeStyle = 'rgba(40,20,10,0.85)';
    ctx.lineWidth = 0.02;
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      for (let k = -1; k <= 1; k++) {
        const wave = Math.sin(time * 4 + k) * 0.02;
        ctx.beginPath();
        ctx.moveTo(nx + side * 0.18, ny + 0.1 + k * 0.05);
        ctx.quadraticCurveTo(nx + side * 0.5, ny + 0.08 + k * 0.1 + wave, nx + side * 0.85, ny + 0.04 + k * 0.17 + wave);
        ctx.stroke();
      }
    }
    ctx.restore();
  },
};
