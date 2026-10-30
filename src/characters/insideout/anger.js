import { tintFace, enterFrame, bsv } from '../helpers.js';

export default {
  name: 'Anger', emoji: '😡', aura: '#FF5A3C', tagY: 0.95,
  draw(ctx, t, f, m, time) {
    tintFace(ctx, t.pts, '#e5322b', 0.85);
    enterFrame(ctx, f);
    // flames erupt from the head; open your mouth (shout!) to make them blaze
    const jaw = bsv(t.bs, 'jawOpen');
    const k = 0.3 + jaw * 1.6;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = -3; i <= 3; i++) {
      const bx = i * 0.16, by = m.top + 0.08;
      const h = k * (0.55 + 0.3 * Math.sin(time * 14 + i * 2.1)) * (1 - Math.abs(i) * 0.12);
      const sway = Math.sin(time * 9 + i) * 0.06;
      const g = ctx.createLinearGradient(bx, by, bx, by - h);
      g.addColorStop(0, 'rgba(255,60,0,0.9)');
      g.addColorStop(0.5, 'rgba(255,150,0,0.8)');
      g.addColorStop(1, 'rgba(255,240,120,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(bx - 0.12, by);
      ctx.quadraticCurveTo(bx - 0.12, by - h * 0.5, bx + sway, by - h);
      ctx.quadraticCurveTo(bx + 0.12, by - h * 0.5, bx + 0.12, by);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    // heavy angry brow
    ctx.strokeStyle = '#4a0a0a';
    ctx.lineWidth = 0.11;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(m.eyeLX - 0.25, m.eyeLY - 0.3);
    ctx.lineTo(-0.04, m.eyeLY - 0.14);
    ctx.moveTo(m.eyeRX + 0.25, m.eyeRY - 0.3);
    ctx.lineTo(0.04, m.eyeRY - 0.14);
    ctx.stroke();
    // white collar + tie under the chin
    const y = m.chin + 0.08;
    ctx.fillStyle = '#f2f2f2';
    ctx.beginPath();
    ctx.moveTo(-0.35, y); ctx.lineTo(0, y + 0.18); ctx.lineTo(0.35, y); ctx.lineTo(0.3, y + 0.25); ctx.lineTo(-0.3, y + 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7a1010';
    ctx.beginPath();
    ctx.moveTo(-0.07, y + 0.15); ctx.lineTo(0.07, y + 0.15); ctx.lineTo(0.1, y + 0.55); ctx.lineTo(0, y + 0.65); ctx.lineTo(-0.1, y + 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },
};
