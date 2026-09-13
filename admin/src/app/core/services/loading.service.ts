import { Injectable, signal } from '@angular/core';

/**
 * Tracks in-flight HTTP requests (see loading.interceptor.ts) and drives the global
 * loading overlay. Show is debounced and hide has a minimum visible duration so a
 * fast request (<150ms) never flashes the overlay, and a shown overlay never flickers
 * off after only a few milliseconds.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count = 0;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private shownAt = 0;

  readonly visible = signal(false);

  private readonly showDelayMs = 150;
  private readonly minVisibleMs = 300;

  show(): void {
    this.count++;
    if (this.count === 1 && !this.showTimer) {
      this.showTimer = setTimeout(() => {
        this.showTimer = null;
        if (this.count > 0) {
          this.visible.set(true);
          this.shownAt = Date.now();
        }
      }, this.showDelayMs);
    }
  }

  hide(): void {
    this.count = Math.max(0, this.count - 1);
    if (this.count > 0) return;

    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
      return;
    }

    if (!this.visible()) return;

    const elapsed = Date.now() - this.shownAt;
    const remaining = this.minVisibleMs - elapsed;
    if (remaining <= 0) {
      this.visible.set(false);
    } else {
      setTimeout(() => {
        if (this.count === 0) this.visible.set(false);
      }, remaining);
    }
  }
}
