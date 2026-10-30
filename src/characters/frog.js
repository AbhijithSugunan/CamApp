import { tintFace, enterFrame, ellipse, bsv } from './helpers.js';

export default {
  name: 'Froggy', emoji: '🐸', aura: '#B8FF5C',
  draw(ctx, t, f, m, time) {
    tintFace(ctx, t.pts, '#5fc23a', 0.8);
    enterFrame(ctx, f);
    // bulging eyes on top of the head
    const eyes = [[-1, bsv(t.bs, 'eyeBlinkLeft')], [1, bsv(t.bs, 'eyeBlinkRight')]];
    for (const [side, blink] of eyes) {
      const x = side * 0.42, y = m.top - 0.05;
      ctx.fillStyle = '#5fc23a';
      ctx.strokeStyle = '#2d6b17';
      ctx.lineWidth = 0.03;
      ellipse(ctx, x, y, 0.3, 0.27); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff';
      ellipse(ctx, x, y - 0.02, 0.22, 0.2); ctx.fill();
      // pupils look around a little
      const lx = Math.sin(time * 0.9) * 0.05 + m.yaw * 0.06;
      ctx.fillStyle = '#111';
      ellipse(ctx, x + lx, y - 0.01, 0.12, 0.07); ctx.fill();
      ctx.fillStyle = '#fff';
      ellipse(ctx, x + lx - 0.04, y - 0.04, 0.025, 0.02); ctx.fill();
      // eyelid closes on blink
      const lid = Math.min(1, blink * 1.2);
      if (lid > 0.05) {
        ctx.fillStyle = '#4caa2c';
        ctx.save();
        ellipse(ctx, x, y - 0.02, 0.23, 0.21); ctx.clip();
        ctx.fillRect(x - 0.25, y - 0.25, 0.5, 0.46 * lid);
        ctx.restore();
      }
    }
    // cheeks
    ctx.fillStyle = 'rgba(255,120,150,0.4)';
    ellipse(ctx, m.left + 0.3, m.noseY + 0.15, 0.13, 0.08); ctx.fill();
    ellipse(ctx, m.right - 0.3, m.noseY + 0.15, 0.13, 0.08); ctx.fill();
    // wide grin line
    const y = (m.mouthTopY + m.mouthBotY) / 2;
    ctx.strokeStyle = '#1f4d10';
    ctx.lineWidth = 0.035;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(m.mouthL - 0.2, y - 0.08);
    ctx.quadraticCurveTo(m.mouthL - 0.05, y + 0.02, m.mouthL + 0.02, y);
    ctx.moveTo(m.mouthR + 0.2, y - 0.08);
    ctx.quadraticCurveTo(m.mouthR + 0.05, y + 0.02, m.mouthR - 0.02, y);
    ctx.stroke();
    ctx.restore();
  },
};
