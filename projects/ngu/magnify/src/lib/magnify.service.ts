import { Injectable, NgZone, inject } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { KeysEvent } from './keysEvent';

@Injectable({ providedIn: 'root' })
export class MagnifyService {
  private keyEvents = new KeysEvent();
  currentMousePosition: MouseEvent;
  currentMouse$ = new Subject<MouseEvent>();
  z$ = new Subject<boolean>();
  private ngZone = inject(NgZone);
  private zSubscription: Subscription;
  private observersIds = new Set<string>();
  private isConnected = false;

  constructor() {}

  private onMouseMove = (ev: MouseEvent) => {
    this.currentMousePosition = ev;
    this.currentMouse$.next(ev);
  };

  add(id: string) {
    this.observersIds.add(id);
    if (!this.isConnected) this.connect();
  }

  remove(id: string) {
    this.observersIds.delete(id);
    if (this.observersIds.size === 0) this.disconnect();
  }

  private disconnect() {
    document.removeEventListener('mousemove', this.onMouseMove);
    this.zSubscription?.unsubscribe();
    this.isConnected = false;
  }

  private connect() {
    this.ngZone.runOutsideAngular(() => {
      this.isConnected = true;
      document.addEventListener('mousemove', ev => this.onMouseMove(ev));
      this.zSubscription = this.keyEvents.event('z').subscribe(([res, ev]) => {
        this.z$.next(res);
      });
    });
  }
}
