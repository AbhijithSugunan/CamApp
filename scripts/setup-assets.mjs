// One-time (online) setup: copies MediaPipe WASM and downloads the face model into public/
// so the app runs fully offline during the event.
import { cpSync, mkdirSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const wasmSrc = join(root, 'node_modules/@mediapipe/tasks-vision/wasm');
const wasmDst = join(root, 'public/mediapipe/wasm');
const modelDst = join(root, 'public/models/face_landmarker.task');
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

mkdirSync(wasmDst, { recursive: true });
cpSync(wasmSrc, wasmDst, { recursive: true });
console.log('Copied WASM ->', wasmDst);

if (existsSync(modelDst) && statSync(modelDst).size > 1_000_000) {
  console.log('Model already present ->', modelDst);
} else {
  mkdirSync(dirname(modelDst), { recursive: true });
  console.log('Downloading face model...');
  const res = await fetch(MODEL_URL);
  if (!res.ok) throw new Error(`Model download failed: ${res.status}`);
  writeFileSync(modelDst, Buffer.from(await res.arrayBuffer()));
  console.log('Saved model ->', modelDst);
}
