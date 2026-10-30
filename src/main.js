import { Camera } from './camera.js';
import { createDetector } from './detector.js';
import { Tracker } from './tracker.js';
import { drawTrack, nextTheme, currentTheme } from './characters/index.js';
import { UI } from './ui.js';

const video = document.getElementById('video');
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

const ui = new UI({
  onSwitchCamera: () => camera.next(),
  onNextTheme: () => ui.toast(`Theme: ${nextTheme(tracker.tracks).label}`),
});
const camera = new Camera(video, (msg, isError) => ui.setStatus(msg, isError));
const tracker = new Tracker();
const map = { W: 0, H: 0, vw: 0, vh: 0, sx: 0, sy: 0, sw: 0, sh: 0 };

let detector = null;
let lastVideoTime = -1;
let lastProcessed = 0;
let fps = 0, frames = 0, fpsStamp = performance.now();

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

// cover-crop the video into the canvas
function updateMap() {
  map.W = canvas.width; map.H = canvas.height;
  map.vw = video.videoWidth; map.vh = video.videoHeight;
  const scale = Math.max(map.W / map.vw, map.H / map.vh);
  map.sw = map.W / scale; map.sh = map.H / scale;
  map.sx = (map.vw - map.sw) / 2; map.sy = (map.vh - map.sh) / 2;
}

function frame(now) {
  resize();
  const { width: W, height: H } = canvas;
  if (video.readyState < 2 || !video.videoWidth) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    return;
  }
  updateMap();

  // mirrored selfie view
  ctx.setTransform(-1, 0, 0, 1, W, 0);
  ctx.drawImage(video, map.sx, map.sy, map.sw, map.sh, 0, 0, W, H);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (detector && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    tracker.update(detector.detect(video, now), map, now);
    lastProcessed = now;
  }

  const time = now / 1000;
  const visible = tracker.visible(now);
  for (const t of visible) {
    try {
      drawTrack(ctx, t, time, ui.showNames);
    } catch (err) {
      console.error('draw error', err);
    }
  }

  frames++;
  if (now - fpsStamp > 1000) {
    fps = (frames * 1000) / (now - fpsStamp);
    frames = 0;
    fpsStamp = now;
  }
  if (ui.debug) {
    ctx.fillStyle = '#0f0';
    for (const t of visible) {
      for (let i = 0; i < t.pts.length; i += 2) ctx.fillRect(t.pts[i] - 1, t.pts[i + 1] - 1, 2, 2);
    }
    ui.setDebug(
      `FPS ${fps.toFixed(1)}  ${detector?.delegate}  far-pass ${detector?.far ? 'on' : 'off'}\n` +
      `video ${map.vw}x${map.vh}  canvas ${W}x${H}\n` +
      `faces ${visible.length}  tracks ${tracker.tracks.length}  theme ${currentTheme().label}`,
    );
  }
}

function loop(now) {
  requestAnimationFrame(loop);
  try {
    frame(now);
  } catch (err) {
    console.error('frame error', err);
  }
}

// Keep the display awake for the whole event.
let wakeLock = null;
async function keepAwake() {
  try {
    if (!wakeLock || wakeLock.released) wakeLock = await navigator.wakeLock?.request('screen');
  } catch (err) {
    console.warn('Wake lock unavailable', err);
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    lastProcessed = performance.now();
    keepAwake();
  }
});

// Watchdog: if detection stalls for 10 s (GPU context loss, frozen stream), recover.
setInterval(() => {
  if (detector && camera.isLive() && !ui.isReady) ui.ready();
  if (document.hidden || !detector || !lastProcessed) return;
  const stale = performance.now() - lastProcessed;
  if (stale > 4000 && video.paused) video.play().catch(() => {});
  if (stale > 10000 && camera.isLive()) {
    console.warn('Watchdog: no frames for 10 s, reloading');
    location.reload();
  }
}, 2000);

async function boot() {
  requestAnimationFrame(loop);
  keepAwake();
  ui.setStatus('Starting camera…');
  const cam = camera.start();
  ui.setStatus('Loading face tracking model…');
  try {
    const params = new URLSearchParams(location.search);
    detector = await createDetector({ maxFaces: 6, far: params.get('far') !== '0' });
  } catch (err) {
    console.error(err);
    ui.setStatus(`Failed to load model: ${err.message}. Run "npm run setup-assets".`, true);
    return;
  }
  await cam;
  if (camera.isLive()) ui.ready();
}

boot();
