// Overlay, keyboard shortcuts, full screen, idle cursor, debug readout.
export class UI {
  constructor(handlers) {
    this.overlay = document.getElementById('overlay');
    this.status = document.getElementById('status');
    this.debugEl = document.getElementById('debug');
    this.debug = false;
    this.showNames = true;

    // Only the first click enters full screen. Once the user leaves full screen (Esc / F),
    // clicks no longer pull them back in; press F to re-enter.
    this.clickToFullscreen = true;
    document.addEventListener('click', () => {
      if (this.clickToFullscreen) this.toggleFullscreen(true);
    });
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) this.clickToFullscreen = false;
    });
    document.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'escape') {
        this.clickToFullscreen = false;
        if (document.fullscreenElement) document.exitFullscreen?.();
      } else if (k === 'f') this.toggleFullscreen();
      else if (k === 'd') { this.debug = !this.debug; this.debugEl.hidden = !this.debug; }
      else if (k === 'n') this.showNames = !this.showNames;
      else if (k === 'c') handlers.onSwitchCamera?.();
      else if (k === 't') handlers.onNextTheme?.();
    });

    let idleTimer;
    const wake = () => {
      document.body.classList.remove('idle');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => document.body.classList.add('idle'), 3000);
    };
    document.addEventListener('mousemove', wake);
    wake();
  }

  setStatus(msg, isError = false) {
    this.status.textContent = msg;
    this.status.classList.toggle('error', isError);
    if (isError) {
      this.isReady = false;
      this.overlay.classList.remove('hidden', 'ready');
    }
  }

  ready() {
    this.isReady = true;
    this.overlay.classList.add('ready');
    this.status.textContent = 'Ready! Step in front of the camera';
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.overlay.classList.add('hidden'), 4000);
  }

  toggleFullscreen(enterOnly = false) {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else if (!enterOnly) {
      document.exitFullscreen?.();
    }
  }

  toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
  }

  setDebug(text) {
    if (this.debug) this.debugEl.textContent = text;
  }
}
