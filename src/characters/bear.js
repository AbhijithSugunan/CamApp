import { tintFace, enterFrame, ellipse, bsv } from './helpers.js';

export default {
  name: 'Teddy', emoji: '🐻', aura: '#FFC27A',
  draw(ctx, t, f, m, time) {
    tintFace(ctx, t.pts, '#a0622d', 0.55);
    enterFrame(ctx, f);
    const perk = 1 + bsv(t.bs, 'browInnerUp') * 0.2;
    // round ears
    for (const side of [-1, 1]) {
      const x = side * 0.62, y = m.top + 0.02 + Math.sin(time * 2 + side) * 0.01;
      ctx.fillStyle = '#7a4520';
      ctx.strokeStyle = '#3e210b';
      ctx.lineWidth = 0.03;
      ellipse(ctx, x, y, 0.25 * perk, 0.25 * perk); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e0a874';
      ellipse(ctx, x, y + 0.02, 0.13 * perk, 0.13 * perk); ctx.fill();
    }
    // muzzle around the nose (stays above the lip so the mouth remains visible)
    ctx.fillStyle = 'rgba(232,190,140,0.85)';
    ellipse(ctx, m.noseX, (m.noseY + m.lipTopY) / 2, 0.3, Math.max(0.12, (m.lipTopY - m.noseY) / 2 + 0.1));
    ctx.fill();
    // nose
    ctx.fillStyle = '#2b1608';
    ellipse(ctx, m.noseX, m.noseY - 0.01, 0.13, 0.09); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ellipse(ctx, m.noseX - 0.04, m.noseY - 0.04, 0.035, 0.02); ctx.fill();
    // nose-to-lip line
    ctx.strokeStyle = '#2b1608';
    ctx.lineWidth = 0.025;
    ctx.beginPath(); ctx.moveTo(m.noseX, m.noseY + 0.07); ctx.lineTo(m.mouthX, m.lipTopY); ctx.stroke();
    ctx.restore();
  },
};
