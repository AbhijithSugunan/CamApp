# CamApp – Development Handoff

Everything needed to continue developing the Character Booth on another machine:
what was built, why, how it works, and what is still open.
For day-of-event usage, see `README.md`.

---

## 1. Project goal

A webcam booth for a one-off event. It runs **locally for 4–5 hours** and is never hosted.

- Opens the camera **full screen** (mirrored selfie view).
- Detects every face (up to 6) and draws an animated **character** over each person: alien, animals, Inside Out emotions, and so on, like Google Meet / Snapchat filters.
- **Fully offline** at runtime: no CDN or network calls.
- Each person **automatically gets their own character** and keeps it while they stay in view.

### Decisions made (keep these unless the requirements change)
| Topic | Decision |
| --- | --- |
| Filter style | 2D masks drawn procedurally in code (Canvas 2D). No 3D models, no image assets. |
| Face tracking | MediaPipe `FaceLandmarker` (`@mediapipe/tasks-vision` 1.2.0): 478 landmarks + 52 blendshapes per face |
| Offline | Model + WASM copied into `public/` by `npm run setup-assets` |
| Assignment | A newcomer gets the least-used character on screen; ties rotate |
| Framework | Vite + vanilla JS (no React etc.) |
| Dropped idea | "Talk back in Joy's voice". The user decided not to build it. |

---

## 2. Setting up on a new machine

Requirements: **Node 18+** (built with Node 22.14 / npm 10.9), plus Chrome or Edge.

```bash
# copy the project folder WITHOUT node_modules/, dist/ (both are regenerated)
# public/ can be copied too (it holds the downloaded assets) or regenerated:
npm install
npm run setup-assets   # needs internet ONCE: copies WASM, downloads face_landmarker.task (~3.7 MB)
npm run dev            # dev server  -> http://localhost:5173 (hot reload)
npm run build          # production build -> dist/
npm run start          # serve dist/ -> http://localhost:4173
```

> The project is a git repo. `.gitignore` excludes `node_modules/`, `dist/`, `public/mediapipe/`
> and `public/models/`, so after cloning always run `npm install && npm run setup-assets`.

Camera access requires `localhost` or HTTPS. Opening `index.html` as a file will not work.

---

## 3. File map

```
CamApp/
  index.html                 <video> (hidden source) + <canvas id="stage"> + overlay, #debug, #toast
  vite.config.js             dev port 5173, preview port 4173
  package.json               scripts: setup-assets, dev, build, start
  start-event.bat            event launcher: builds if needed, starts server, opens Chrome/Edge --kiosk
  scripts/setup-assets.mjs   copies node_modules/@mediapipe/tasks-vision/wasm -> public/mediapipe/wasm,
                             downloads model -> public/models/face_landmarker.task
  public/                    (generated) offline assets, served at /mediapipe/wasm and /models/
  src/
    main.js                  boot, render loop, cover-crop mapping, wake lock, watchdog
    camera.js                getUserMedia (1280x720), auto-reconnect with backoff, camera switching
    detector.js              FaceLandmarker (GPU -> CPU fallback) + second "far" pass on a centre crop
    tracker.js               stable per-person IDs, adaptive smoothing, character assignment
    ui.js                    overlay, keyboard shortcuts, full screen logic, toast, idle cursor
    style.css
    characters/
      index.js               registry, THEMES, pickCharacter, nextTheme, drawTrack, sparkles, name tag
      helpers.js             landmark indices, face frame, measurements, tintFace, drawing utils
      alien.js cat.js dog.js panda.js robot.js frog.js devil.js bear.js
      insideout/joy.js sadness.js anger.js disgust.js fear.js anxiety.js
```

---

## 4. How it works

### Frame pipeline (`main.js`)
1. `requestAnimationFrame` loop. Each frame is wrapped in try/catch, so one bad frame never kills the loop.
2. The video is drawn to the canvas **mirrored** and **cover-cropped**. The mapping is held in `map` (`W,H,vw,vh,sx,sy,sw,sh`).
3. Detection runs only when `video.currentTime` has changed.
4. `tracker.update(detector.detect(video, now), map, now)` converts normalized landmarks to **mirrored screen pixels**.
5. Each visible track is drawn with `drawTrack(ctx, track, time, showNames)`.

### Detection (`detector.js`)
- Pass 1: the full frame.
- Pass 2 (the "far" pass): a centre square crop, which makes faces about 1.8x larger on a 16:9 camera. It exists because MediaPipe's short-range detector **missed small/far faces** in testing.
- Pass-2 faces that duplicate a pass-1 face (anchor point 168 within one eye-width) are dropped.
- `detect()` returns `[{ lms, bs, ox, oy, sx, sy }]`. The video-normalized point is `(ox + x*sx, oy + y*sy)`.
- `?far=0` disables pass 2. Pass 2 is skipped automatically if the camera is roughly square.

### Tracking (`tracker.js`)
- Faces are matched to existing tracks by nearest anchor (landmark 168) within `1.5 × eye distance`.
- **Adaptive EMA** on the landmarks: `alpha = min(1, 0.45 + move*3)`. Fast motion follows quickly; jitter is damped when the head is still. This is needed because MediaPipe only smooths when `numFaces = 1`.
- Blendshapes are smoothed with alpha 0.5.
- A track is still **drawn** for 250 ms after it is lost (`SHOW_MS`) and **remembered** for 1500 ms (`KEEP_MS`), so a person keeps their character through brief occlusion.

### Character coordinate system (`helpers.js`)
`computeFrame(pts)` builds a local face frame:
- origin = landmark 168 (between the eyes)
- x axis along the eye line, so it rotates with head roll
- **1 unit = outer-eye-corner distance**

So a character is drawn once in local units and automatically follows position, tilt and scale.

`measure(pts, f)` returns local measurements in `m`:
`top, chin, left, right, noseX/Y, mouthX, mouthTopY, mouthBotY, lipTopY, mouthL/R, eyeLX/Y, eyeRX/Y, yaw`.

> The screen is mirrored, so the subject's *left* eye (263) appears on screen-left. `eyeL*` = screen-left.

Useful helpers:
- `tintFace(ctx, pts, color, alpha, mode)`: recolours skin using blend modes (`color` keeps shading). It uses an **extended face oval**, pushed up toward the hairline, because the mesh stops mid-forehead.
- `facePath`, `polyPath`, `enterFrame(ctx, f)` (remember `ctx.restore()`), `ellipse`, `glow`, `bsv(bs, name)`.
- Landmark constants: `FACE_OVAL`, `EYE_SCREEN_LEFT/RIGHT`, `LIPS_OUTER/INNER`, `L.*`.

### Blendshapes used for animation
`jawOpen` (dog tongue, robot equalizer, Anger flames), `eyeBlinkLeft/Right`, `browInnerUp` (ears/antennae perk, Fear brows), `browDownLeft/Right` (devil), `mouthFrownLeft/Right` (Sadness tears).

---

## 5. Adding a new character

1. Create `src/characters/<name>.js`:
   ```js
   import { tintFace, enterFrame, ellipse, bsv } from './helpers.js';
   export default {
     name: 'Display Name', emoji: '🦊', aura: '#FF9900', // aura = sparkle + name tag colour
     tagY: 0.35,               // optional: name tag distance below chin (face units)
     draw(ctx, t, f, m, time) {
       tintFace(ctx, t.pts, '#ff9900', 0.6);   // screen-space work first
       enterFrame(ctx, f);                      // then local face units
       // ... draw using m.* and bsv(t.bs, 'jawOpen') ...
       ctx.restore();
     },
   };
   ```
2. Import it in `characters/index.js` and add it to `ANIMALS`, `INSIDE_OUT`, or a new group plus a new entry in `THEMES`.
3. Check it visually: `npm run build && npm run start`, then open `/?only=<key>` (see section 7).

---

## 6. Controls & URL options

| Key | Action |
| --- | --- |
| Click | Enter full screen (first click only) |
| F | Toggle full screen |
| Esc | Exit full screen (not in kiosk mode) |
| T | Next theme: Everything → Aliens & Animals → Inside Out (→ Custom if `?only=`) |
| N | Toggle name tags |
| C | Switch camera |
| D | Debug overlay: FPS, delegate, far-pass, faces/tracks, theme + landmark dots |

| URL | Effect |
| --- | --- |
| `?theme=all\|animals\|insideout` | Starting theme |
| `?only=joy,anger,alien` | Exact roster (keys: alien, cat, robot, dog, frog, panda, devil, bear, joy, sadness, anger, disgust, fear, anxiety) |
| `?far=0` | Disable the far-face pass |

---

## 7. Change log (session of 2026-10-30)

1. **Scaffold:** Vite + `@mediapipe/tasks-vision`, plus an offline asset script.
2. **Core:**
   - camera with reconnect
   - detector with GPU→CPU fallback
   - mirrored cover-crop render loop
   - tracker with stable IDs and smoothing
3. **8 characters:** Alien, Kitty, Robot, Puppy, Froggy, Panda, Lil Devil, Teddy. Each has sparkles and a name tag.
4. **Stability for a 4–5 h run:**
   - Screen Wake Lock (re-requested on `visibilitychange`)
   - camera `ended`/`devicechange` reconnect with backoff
   - a watchdog that reloads the page after 10 s without processed frames
   - per-frame and per-character try/catch
5. **`start-event.bat`:** builds if needed, starts the server, and launches Chrome/Edge with `--kiosk --use-fake-ui-for-media-stream` (camera auto-allowed).
6. **Far-face detection pass**, added after testing showed small faces were missed.
7. **Visual fixes:**
   - the face tint now reaches the hairline (extended oval)
   - Puppy ears moved outward
   - the tongue now needs `jawOpen > 0.35`, because a smile was triggering it
8. **Inside Out theme:**
   - Joy, Sadness, Anger, Disgust, Fear and Anxiety
   - the theme system and T key, with a toast
   - `?theme=` / `?only=`
   - a `tagY` option to keep name tags off Anger's tie and Fear's bow tie
9. **Full-screen fix:** clicks no longer force the app back into full screen after the user exits. Esc exits.
   Note: **kiosk mode (the .bat) ignores Esc by design**. Use Alt+F4, or run without the .bat.

---

## 8. Testing without a webcam (how this was verified)

Headless Chrome via `puppeteer-core`, with `getUserMedia` faked to return a canvas stream of a test portrait. The scripts were temporary; recreate them like this:

```js
// test/run.mjs   usage: node run.mjs portrait.jpg out.png <copies> "?only=joy,anger"
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
const [,, img, out, copies = '2', query = ''] = process.argv;
const src = 'data:image/jpeg;base64,' + readFileSync(img).toString('base64');
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', defaultViewport: { width: 1600, height: 900 },
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage();
page.on('console', (m) => console.log(m.text()));
await page.evaluateOnNewDocument((src, n) => {
  navigator.mediaDevices.getUserMedia = async () => {
    const im = new Image(); im.src = src; await im.decode();
    const c = Object.assign(document.createElement('canvas'), { width: 1280, height: 720 });
    const g = c.getContext('2d');
    setInterval(() => {
      g.fillStyle = '#333'; g.fillRect(0, 0, 1280, 720);
      const w = 1280 / n, h = (w / im.width) * im.height, s = Math.min(1, 720 / h);
      for (let i = 0; i < n; i++) g.drawImage(im, i * w + (w - w * s) / 2, (720 - h * s) / 2, w * s, h * s);
    }, 33);
    return c.captureStream(30);
  };
}, src, Number(copies));
await page.goto('http://localhost:4173/' + query);
await new Promise((r) => setTimeout(r, 9000));
await page.keyboard.press('d'); await new Promise((r) => setTimeout(r, 1500));
console.log(await page.$eval('#debug', (e) => e.textContent));
await page.keyboard.press('d'); await page.screenshot({ path: out });
await browser.close();
```

- Setup: `npm i puppeteer-core` in a separate folder.
- Test image: `https://storage.googleapis.com/mediapipe-assets/portrait.jpg`.

Results observed:
- GPU delegate works.
- About 23–26 fps headless with faces present, and about 76 fps with no faces.
- 2 side-by-side faces get 2 different characters.
- All 14 characters render.

---

## 9. Open items / not yet done

- [ ] **Real-hardware test** on the event laptop and webcam: several people, movement, blinking, talking, entering and leaving the frame.
- [ ] Confirm FPS ≥ 24 with D (if it's lower, try `?far=0`).
- [ ] Offline test: Wi-Fi off, restart, confirm everything loads.
- [ ] 30–60 min soak test: watch FPS and memory in the DevTools Performance monitor.
- [ ] Unplug and replug the webcam to confirm auto-recovery.
- [ ] Optional: make `start-event.bat` open a specific theme (`set URL=http://localhost:4173/?theme=insideout`).
- [x] `git init` + `.gitignore` (see section 2).

### Known limitations
- Faces far from the camera and **at the edges** of the frame may still be missed; the far pass only covers the centre. Position the camera so people stand centred, 0.5–2.5 m away.
- Inside Out characters are fan art of Disney/Pixar IP. That's fine for a private event; check licensing if the event is public or commercial.
