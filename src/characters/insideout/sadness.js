import { tintFace, enterFrame, ellipse, bsv } from '../helpers.js';

export default {
  name: 'Sadness', emoji: '😢', aura: '#7FB2FF',
  draw(ctx, t, f, m, time) {
    tintFace(ctx, t.pts, '#4f8fe0', 0.85);
    enterFrame(ctx, f);
    // dark blue bob with a heavy fringe
    const bottom = m.noseY + 0.4;
    ctx.fillStyle = '#1d3f8a';
    ctx.strokeStyle = '#0d2152';
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.moveTo(m.left - 0.18, bottom);
    ctx.bezierCurveTo(m.left - 0.3, m.top - 0.1, m.left + 0.1, m.top - 0.55, 0, m.top - 0.5);
    ctx.bezierCurveTo(m.right - 0.1, m.top - 0.55, m.right + 0.3, m.top - 0.1, m.right + 0.18, bottom);
    ctx.lineTo(m.right - 0.02, bottom - 0.05);
    ctx.quadraticCurveTo(m.right + 0.02, m.top + 0.35, m.right - 0.2, m.top + 0.22);
    ctx.quadraticCurveTo(0, m.top + 0.32, m.left + 0.2, m.top + 0.22);
    ctx.quadraticCurveTo(m.left - 0.02, m.top + 0.35, m.left + 0.02, bottom - 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // round glasses
    ctx.strokeStyle = '#151515';
    ctx.lineWidth = 0.05;
    for (const [x, y] of [[m.eyeLX, m.eyeLY], [m.eyeRX, m.eyeRY]]) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ellipse(ctx, x, y, 0.26, 0.26);
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(m.eyeLX + 0.26, m.eyeLY);
    ctx.quadraticCurveTo(0, Math.min(m.eyeLY, m.eyeRY) - 0.08, m.eyeRX - 0.26, m.eyeRY);
    ctx.stroke();
    // a tear rolls down now and then (more often when frowning)
    const frown = bsv(t.bs, 'mouthFrownLeft') + bsv(t.bs, 'mouthFrownRight');
    const phase = (time * (0.45 + frown)) % 1;
    const tx = m.eyeLX - 0.05, ty = m.eyeLY + 0.28 + phase * 0.7;
    ctx.globalAlpha = 1 - phase;
    ctx.fillStyle = '#bfe3ff';
    ctx.strokeStyle = '#3d7fd1';
    ctx.lineWidth = 0.02;
    ctx.beginPath();
    ctx.moveTo(tx, ty - 0.12);
    ctx.quadraticCurveTo(tx + 0.08, ty, tx, ty + 0.05);
    ctx.quadraticCurveTo(tx - 0.08, ty, tx, ty - 0.12);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },
};
