# Character Booth (CamApp)

Full-screen webcam booth that turns everyone on camera into a character
(Alien, Kitty, Robot, Puppy, Froggy, Panda, Lil Devil, Teddy, plus the Inside Out emotions:
Joy, Sadness, Anger, Disgust, Fear, Anxiety). Each person gets their own
character and keeps it while they stay in view. Runs 100% offline once set up.

## One-time setup (needs internet)
```
npm install
npm run setup-assets   # copies MediaPipe WASM + downloads the face model into public/
npm run build
```

## At the event
Double-click **`start-event.bat`**. It starts the local server and opens Chrome (or Edge) in
kiosk mode, full screen with the camera auto-allowed. **Kiosk mode cannot be left with Esc**: exit with **Alt+F4**, then close the server window.
If you want Esc to work, use the manual way below instead of the .bat file.

Manual alternative: `npm run start`, open http://localhost:4173, and click anywhere for full screen.

## Controls
| Key | Action |
| --- | --- |
| Click | Enter full screen (first click only) |
| F | Toggle full screen |
| Esc | Exit full screen (browser mode) |
| T | Next theme: Everything → Aliens & Animals → Inside Out |
| N | Toggle name tags |
| C | Switch camera (if several are connected) |
| D | Debug overlay (FPS, faces, landmarks) |

## URL options
- `?theme=insideout` starts in a theme (`all`, `animals`, `insideout`)
- `?only=alien,cat,robot` uses only these characters (alien, cat, robot, dog, frog, panda, devil, bear, joy, sadness, anger, disgust, fear, anxiety)
- `?far=0` disables the extra "far away" detection pass (saves CPU/GPU on slow machines)

## Tips
- Keep people about 0.5–2.5 m from the camera and well lit from the front.
- Faces in the centre of the frame are detected further away than faces at the edges.
- The app recovers by itself from camera unplug/replug and stalled frames (auto-reload watchdog),
  and keeps the screen awake.
