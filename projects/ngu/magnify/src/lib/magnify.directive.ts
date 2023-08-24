import {
  Directive,
  ElementRef,
  Renderer2,
  Input,
  NgZone,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { MagnifyService } from './magnify.service';

@Directive({
  standalone: true,
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[magnify]',
})
export class Magnify implements OnInit, OnDestroy {
  @Input('magnify') imgSrc: string;
  @Input('inline') inline = true;
  @Input() scale = 4;
  private magnifyService = inject(MagnifyService);
  private div: HTMLElement;
  private imgDiv: HTMLElement;
  private img: HTMLImageElement;
  private scaleXValue = 1;
  private scaleYValue = 1;
  subscription: Subscription;
  zSubscription: Subscription;
  z$ = new Subject<boolean>();
  isZoomed = false;
  id = Date.now().toString();

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {
    this.magnifyService.add(this.id);
  }

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.el.nativeElement.addEventListener('load', this.updateSizes, {
        once: true,
      });
      // this.initClick();
      this.zInit();
    });
  }

  private initClick() {
    this.el.nativeElement.addEventListener('click', (ev) => {
      this.isZoomed = !this.isZoomed;
      this.z$.next(this.isZoomed);
    });
  }

  private zInit() {
    this.zSubscription = this.magnifyService.z$.subscribe((res) => {
      if (res) {
        this.el.nativeElement.addEventListener('mouseenter', this.onMouseEnter);
        // if el is already hovered then trigger mouseenter
        if (this.el.nativeElement.matches(':hover')) {
          this.onMouseEnter();
          this.onMouseMove(this.magnifyService.currentMousePosition);
        }
      } else {
        this.el.nativeElement.removeEventListener(
          'mouseenter',
          this.onMouseEnter
        );
        // this.onMouseEnter();
        this.onMouseLeave();
      }
    });
  }

  private loading = () => {
    this.el.nativeElement.style.cursor = 'unset';
  };

  ngOnDestroy() {
    this.el.nativeElement.removeEventListener('load', this.updateSizes);
    this.img?.removeEventListener('load', this.updateSizes);
    this.zSubscription?.unsubscribe();
    this.subscription?.unsubscribe();
    this.div?.remove();
    this.magnifyService.remove(this.id);
  }

  updateSizes = () => {
    if (!this.div) return;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const parent = this.parentElement.getBoundingClientRect();

    var { cWidth, cHeight, left, top, width, height } = this.getValues(
      rect,
      parent
    );

    this.renderer.setStyle(this.div, 'width', `${cWidth}px`);
    this.renderer.setStyle(this.div, 'height', `${cHeight}px`);
    this.renderer.setStyle(this.div, 'left', `${left}px`);
    this.renderer.setStyle(this.div, 'top', `${top}px`);

    this.renderer.setStyle(this.imgDiv, 'width', `${width}px`);
    this.renderer.setStyle(this.imgDiv, 'height', `${height}px`);
  };

  private getValues(rect: DOMRect, parent: DOMRect) {
    let left = rect.left - parent.left;
    let top = rect.top - parent.top;
    let cWidth = rect.width;
    let cHeight = rect.height;

    if (!this.inline) {
      cWidth = 400;
      cHeight = 400;
    }

    const width = rect.width * this.scale;
    const localScale = width / rect.width;
    const height = rect.height * localScale;

    this.scaleXValue = (width - cWidth) / rect.width;
    this.scaleYValue = (height - cHeight) / rect.height;

    if (!this.inline) {
      // Determine whether to show magnified image on the left or right
      const screenWidth = window.innerWidth;
      const showOnLeft = left > screenWidth / 2;

      left = showOnLeft ? left - cWidth - 10 : left + rect.width + 10

      // Determine whether to position magnified image above or below original image
      const screenHeight = window.innerHeight;
      const showAbove = (top + cHeight) > screenHeight;

      if (showAbove) {
        top -= (cHeight - rect.height);
      }
    }

    return {
      cWidth,
      cHeight,
      left,
      top,
      width,
      height
    };
  }

  private get parentElement() {
    const el = this.inline
      ? this.el.nativeElement.parentElement
      : document.body;
    return el as HTMLElement;
  }

  onMouseEnter = () => {
    if (!this.div) {
      this.div = this.renderer.createElement('div');
      this.imgDiv = this.renderer.createElement('div');
      this.img = this.renderer.createElement('img');
      this.renderer.appendChild(this.imgDiv, this.img);
      this.renderer.appendChild(this.div, this.imgDiv);
      this.renderer.setStyle(this.div, 'z-index', '99999');
      this.renderer.setStyle(this.div, 'position', 'absolute');
      this.renderer.setStyle(this.div, 'overflow', 'hidden');
      this.renderer.setStyle(this.div, 'display', 'none');
      this.renderer.setStyle(this.div, 'pointer-events', 'none');

      if (!this.inline) {
        this.renderer.setStyle(
          this.div,
          'box-shadow',
          '0 0 10px rgba(0, 0, 0, 0.2)'
        );
      }
      this.renderer.setStyle(this.imgDiv, 'position', 'absolute');
      this.renderer.setStyle(this.img, 'position', 'absolute');
      this.renderer.setStyle(this.img, 'width', '100%');
      this.renderer.appendChild(this.parentElement, this.div);
    }
    // this.el.nativeElement.addEventListener('mousemove', this.onMouseMove);
    this.subscription = this.magnifyService.currentMouse$.subscribe((ev) =>
      this.onMouseMove(ev)
    );
    this.el.nativeElement.addEventListener('mouseleave', this.onMouseLeave);
    this.updateSizes();
    this.renderer.setStyle(this.div, 'display', 'block');
    const img = this.imgSrc || this.el.nativeElement.src;
    if (this.img.src !== img) {
      this.el.nativeElement.style.cursor = 'progress';
      this.renderer.setProperty(this.img, 'src', img);
      this.img.addEventListener('load', this.loading, { once: true });
    }
  };

  onMouseMove = (event: MouseEvent) => {
    if (this.div.style.display !== 'none') {
      const rect = this.el.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const tx = -x * this.scaleXValue;
      const ty = -y * this.scaleYValue;
      this.renderer.setStyle(
        this.imgDiv,
        'transform',
        `translate(${tx}px, ${ty}px)`
      );
    }
  };

  onMouseLeave = () => {
    // this.el.nativeElement.removeEventListener('mousemove', this.onMouseMove);
    this.subscription?.unsubscribe();
    this.isZoomed = false;
    this.el.nativeElement.removeEventListener('mouseleave', this.onMouseLeave);
    if (this.div) this.renderer.setStyle(this.div, 'display', 'none');
  };
}
