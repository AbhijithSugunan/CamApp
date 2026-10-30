import { tintFace, enterFrame, ellipse, bsv } from './helpers.js';

export default {
  name: 'Panda', emoji: '🐼', aura: '#FFFFFF',
  draw(ctx, t, f, m, time) {
    tintFace(ctx, t.pts, '#ffffff', 0.85, 'saturation');
    tintFace(ctx, t.pts, '#9a9a9a', 0.6, 'screen');
    enterFrame(ctx, f);
    const perk = 1 + bsv(t.bs, 'browInnerUp') * 0.2;
    // ears
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#111';
      ellipse(ctx, side * 0.62, m.top - 0.02 - Math.sin(time * 2 + side) * 0.01, 0.24 * perk, 0.22 * perk);
      ctx.fill();
      ctx.fillStyle = '#333';
      ellipse(ctx, side * 0.62, m.top, 0.12, 0.1);
      ctx.fill();
    }
    // eye patches
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(15,15,15,0.85)';
    ellipse(ctx, m.eyeLX - 0.02, m.eyeLY + 0.05, 0.26, 0.19, 0.5); ctx.fill();
    ellipse(ctx, m.eyeRX + 0.02, m.eyeRY + 0.05, 0.26, 0.19, -0.5); ctx.fill();
    ctx.restore();
    // eye sparkle
    const eyes = [[m.eyeLX, m.eyeLY, bsv(t.bs, 'eyeBlinkLeft')], [m.eyeRX, m.eyeRY, bsv(t.bs, 'eyeBlinkRight')]];
    for (const [x, y, b] of eyes) {
      if (b < 0.5) {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ellipse(ctx, x - 0.03, y - 0.03, 0.025, 0.025);
        ctx.fill();
      }
    }
    // nose
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.moveTo(m.noseX - 0.1, m.noseY - 0.05);
    ctx.quadraticCurveTo(m.noseX, m.noseY - 0.1, m.noseX + 0.1, m.noseY - 0.05);
    ctx.quadraticCurveTo(m.noseX, m.noseY + 0.12, m.noseX - 0.1, m.noseY - 0.05);
    ctx.fill();
    ctx.restore();
  },
};
