import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { KeysEvent } from "./keysEvent";

@Injectable({ providedIn: 'root' })
export class MagnifyService {
  keyEvents = new KeysEvent();
  currentMousePosition: MouseEvent;
  currentMouse$ = new Subject<MouseEvent>();
  z$ = new Subject<boolean>();

  constructor() {
    document.addEventListener('mousemove', ev => this.onMouseMove(ev));
    this.keyEvents.event('z').subscribe(([res, ev]) => {
      this.z$.next(res);
    });
  }

  onMouseMove = (ev: MouseEvent) => {
    this.currentMousePosition = ev;
    this.currentMouse$.next(ev);
  };
}
