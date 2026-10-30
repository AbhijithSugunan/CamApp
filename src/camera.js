// Webcam access with automatic reconnect (unplug/replug, driver hiccups).
export class Camera {
  constructor(video, onStatus) {
    this.video = video;
    this.onStatus = onStatus;
    this.stream = null;
    this.deviceIndex = -1; // -1 = default front camera
    this.devices = [];
    this.retryDelay = 1000;
    this.connecting = false;
    navigator.mediaDevices.addEventListener('devicechange', () => {
      if (!this.isLive()) this.start();
    });
  }

  isLive() {
    const track = this.stream?.getVideoTracks()[0];
    return !!track && track.readyState === 'live';
  }

  async start() {
    if (this.connecting) return;
    this.connecting = true;
    this.stop();
    try {
      const video = { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } };
      const dev = this.devices[this.deviceIndex];
      if (dev) video.deviceId = { exact: dev.deviceId };
      else video.facingMode = 'user';
      this.stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
      const track = this.stream.getVideoTracks()[0];
      track.addEventListener('ended', () => this.scheduleRetry('Camera disconnected'));
      this.video.srcObject = this.stream;
      await this.video.play();
      this.retryDelay = 1000;
      this.devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
      this.onStatus?.(`Camera: ${track.label || 'ready'}`);
    } catch (err) {
      console.error('Camera error', err);
      const msg = err.name === 'NotAllowedError' ? 'Camera permission denied' : `Camera error: ${err.message}`;
      this.connecting = false;
      this.scheduleRetry(msg, true);
      return;
    }
    this.connecting = false;
  }

  scheduleRetry(msg, isError = true) {
    this.onStatus?.(`${msg} – retrying…`, isError);
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.start(), this.retryDelay);
    this.retryDelay = Math.min(this.retryDelay * 2, 8000);
  }

  async next() {
    this.devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
    if (this.devices.length < 2) return;
    this.deviceIndex = (this.deviceIndex + 1) % this.devices.length;
    await this.start();
  }

  stop() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}
