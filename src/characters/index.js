import alien from './alien.js';
import cat from './cat.js';
import dog from './dog.js';
import panda from './panda.js';
import robot from './robot.js';
import frog from './frog.js';
import devil from './devil.js';
import bear from './bear.js';
import joy from './insideout/joy.js';
import sadness from './insideout/sadness.js';
import anger from './insideout/anger.js';
import disgust from './insideout/disgust.js';
import fear from './insideout/fear.js';
import anxiety from './insideout/anxiety.js';
import { computeFrame, measure, enterFrame } from './helpers.js';

const ANIMALS = { alien, cat, robot, dog, frog, panda, devil, bear };
const INSIDE_OUT = { joy, sadness, anger, disgust, fear, anxiety };
const ALL = { ...ANIMALS, ...INSIDE_OUT };

export const THEMES = {
  all: { label: 'Everything', roster: Object.values(ALL) },
  animals: { label: 'Aliens & Animals', roster: Object.values(ANIMALS) },
  insideout: { label: 'Inside Out', roster: Object.values(INSIDE_OUT) },
};

const params = new URLSearchParams(location.search);
// ?only=joy,anger,alien picks an exact roster and overrides themes
const only = params.get('only');
const picked = only ? only.split(',').map((k) => ALL[k.trim().toLowerCase()]).filter(Boolean) : [];
if (picked.length) THEMES.custom = { label: 'Custom', roster: picked };

let themeKey = picked.length ? 'custom' : THEMES[params.get('theme')] ? params.get('theme') : 'all';
let roster = THEMES[themeKey].roster;
let rotor = Math.floor(Math.random() * roster.length);

export function currentTheme() {
  return THEMES[themeKey];
}

// T key: move to the next theme and re-dress everyone currently on screen.
export function nextTheme(tracks) {
  const keys = Object.keys(THEMES);
  themeKey = keys[(keys.indexOf(themeKey) + 1) % keys.length];
  roster = THEMES[themeKey].roster;
  for (const t of tracks) t.character = null;
  for (const t of tracks) t.character = pickCharacter(tracks);
  return THEMES[themeKey];
}

// Give a newcomer the character least used by the people currently on screen;
// ties rotate so consecutive visitors see variety.
export function pickCharacter(tracks) {
  const counts = new Array(roster.length).fill(0);
  for (const t of tracks) {
    const i = roster.indexOf(t.character);
    if (i >= 0) counts[i]++;
  }
  const min = Math.min(...counts);
  for (let k = 0; k < roster.length; k++) {
    const i = (rotor + k) % roster.length;
    if (counts[i] === min) {
      rotor = (i + 1) % roster.length;
      return roster[i];
    }
  }
  return roster[0];
}

const frame = {};

export function drawTrack(ctx, track, time, showName) {
  const f = computeFrame(track.pts, frame);
  const m = measure(track.pts, f);
  ctx.save();
  track.character.draw(ctx, track, f, m, time);
  ctx.restore();
  drawSparkles(ctx, f, m, track, time);
  if (showName) drawNameTag(ctx, f, m, track.character);
}

function drawSparkles(ctx, f, m, track, time) {
  enterFrame(ctx, f);
  ctx.fillStyle = track.character.aura;
  for (let i = 0; i < 5; i++) {
    const a = time * 0.8 + i * ((Math.PI * 2) / 5) + track.id;
    const r = 1.25 + Math.sin(time * 2 + i) * 0.08;
    const x = Math.cos(a) * r * 0.95, y = Math.sin(a) * r * 1.15 + 0.25;
    const s = 0.05 * (0.5 + 0.5 * Math.sin(time * 6 + i * 2));
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(x, y - s * 2); ctx.lineTo(x + s * 0.5, y - s * 0.5); ctx.lineTo(x + s * 2, y);
    ctx.lineTo(x + s * 0.5, y + s * 0.5); ctx.lineTo(x, y + s * 2); ctx.lineTo(x - s * 0.5, y + s * 0.5);
    ctx.lineTo(x - s * 2, y); ctx.lineTo(x - s * 0.5, y - s * 0.5); ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawNameTag(ctx, f, m, character) {
  // upright label under the chin, independent of head tilt
  const lx = 0, ly = m.chin + (character.tagY ?? 0.35);
  const x = f.cx + (lx * f.cos - ly * f.sin) * f.s;
  const y = f.cy + (lx * f.sin + ly * f.cos) * f.s;
  const size = Math.max(16, Math.min(48, f.s * 0.28));
  const text = `${character.emoji} ${character.name}`;
  ctx.save();
  ctx.font = `700 ${size}px system-ui, "Segoe UI Emoji", sans-serif`;
  const w = ctx.measureText(text).width + size;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8);
  ctx.fill();
  ctx.fillStyle = character.aura;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + size * 0.05);
  ctx.restore();
}
