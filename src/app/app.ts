import { Component, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class App implements OnInit {
  protected readonly title = signal('angular-standalone-orders');
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initBreakpoints();
    }
  }

  private initBreakpoints(): void {
    const mobile = window.matchMedia('(max-width: 600px)');
    const tablet = window.matchMedia('(max-width: 960px)');
    const desktop = window.matchMedia('(min-width: 961px)');

    const updateClasses = () => {
      const html = document.documentElement;
      html.classList.remove('mobile', 'tablet', 'desktop');

      if (mobile.matches) {
        html.classList.add('mobile');
      } else if (tablet.matches) {
        html.classList.add('tablet');
      } else {
        html.classList.add('desktop');
      }
    };

    mobile.addEventListener('change', updateClasses);
    tablet.addEventListener('change', updateClasses);
    desktop.addEventListener('change', updateClasses);

    // Initial
    updateClasses();
  }
}
