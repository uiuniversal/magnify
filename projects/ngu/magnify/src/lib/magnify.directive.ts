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
import { Subscription } from 'rxjs';
import { MagnifyService } from './magnify.service';

@Directive({
  standalone: true,
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[magnify]'
})
export class MagnifyDirective implements OnInit, OnDestroy {
  @Input('magnify') imgSrc: string;
  @Input() scale = 4;
  private magnifyService = inject(MagnifyService);
  private div: HTMLElement;
  private imgDiv: HTMLElement;
  private img: HTMLImageElement;
  private scaleValue = 1;
  subscription: Subscription;
  zSubscription: Subscription;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.el.nativeElement.addEventListener('load', this.updateSizes, { once: true });
      this.init();
    });
  }

  private init() {
    this.zSubscription = this.magnifyService.z$.subscribe(res => {
      if (res) {
        this.el.nativeElement.addEventListener('mouseenter', this.onMouseEnter);
        // if el is already hovered then trigger mouseenter
        if (this.el.nativeElement.matches(':hover')) {
          this.onMouseEnter();
          this.onMouseMove(this.magnifyService.currentMousePosition);
        }
      } else {
        this.el.nativeElement.removeEventListener('mouseenter', this.onMouseEnter);
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
  }

  updateSizes = () => {
    if (!this.div) return;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const parent = this.parentElement.getBoundingClientRect();
    this.renderer.setStyle(this.div, 'width', `${rect.width}px`);
    this.renderer.setStyle(this.div, 'height', `${rect.height}px`);
    this.renderer.setStyle(this.div, 'left', `${rect.left - parent.left}px`);
    this.renderer.setStyle(this.div, 'top', `${rect.top - parent.top}px`);
    const width = rect.width * this.scale;
    const localScale = width / rect.width;
    const height = rect.height * localScale;
    this.renderer.setStyle(this.imgDiv, 'width', `${width}px`);
    this.renderer.setStyle(this.imgDiv, 'height', `${height}px`);
    this.scaleValue = (width - rect.width) / rect.width;
  };

  private get parentElement() {
    return this.el.nativeElement.parentElement as HTMLElement;
  }

  onMouseEnter = () => {
    if (!this.div) {
      this.div = this.renderer.createElement('div');
      this.imgDiv = this.renderer.createElement('div');
      this.img = this.renderer.createElement('img');
      this.renderer.appendChild(this.imgDiv, this.img);
      this.renderer.appendChild(this.div, this.imgDiv);
      this.renderer.setStyle(this.div, 'position', 'absolute');
      this.renderer.setStyle(this.div, 'overflow', 'hidden');
      this.renderer.setStyle(this.div, 'display', 'none');
      this.renderer.setStyle(this.div, 'pointer-events', 'none');
      this.renderer.setStyle(this.imgDiv, 'position', 'absolute');
      this.renderer.setStyle(this.img, 'position', 'absolute');
      this.renderer.setStyle(this.img, 'width', '100%');
      this.renderer.appendChild(this.parentElement, this.div);
    }
    // this.el.nativeElement.addEventListener('mousemove', this.onMouseMove);
    this.subscription = this.magnifyService.currentMouse$.subscribe(ev => this.onMouseMove(ev));
    this.el.nativeElement.addEventListener('mouseleave', this.onMouseLeave);
    this.updateSizes();
    this.renderer.setStyle(this.div, 'display', 'block');
    if (this.img.src !== this.imgSrc) {
      this.el.nativeElement.style.cursor = 'progress';
      this.renderer.setProperty(this.img, 'src', this.imgSrc);
      this.img.addEventListener('load', this.loading, { once: true });
    }
  };

  onMouseMove = (event: MouseEvent) => {
    if (this.div.style.display !== 'none') {
      const rect = this.el.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const tx = -x * this.scaleValue;
      const ty = -y * this.scaleValue;
      this.renderer.setStyle(this.imgDiv, 'transform', `translate(${tx}px, ${ty}px)`);
    }
  };

  onMouseLeave = () => {
    // this.el.nativeElement.removeEventListener('mousemove', this.onMouseMove);
    this.subscription?.unsubscribe();
    this.el.nativeElement.removeEventListener('mouseleave', this.onMouseLeave);
    if (this.div) this.renderer.setStyle(this.div, 'display', 'none');
  };
}
