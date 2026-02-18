import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class App implements OnInit {
  protected readonly title = signal('angular-standalone-orders');
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initBreakpoints();
      this.initDarkMode();
    }
  }

  private initBreakpoints(): void {
    const mobile = window.matchMedia('(max-width: 600px)');
    const tablet = window.matchMedia('(min-width: 601px) and (max-width: 960px)');
    const desktop = window.matchMedia('(min-width: 961px)');

    const updateClasses = (): void => {
      const html = document.documentElement;
      html.classList.remove('mobile', 'tablet', 'desktop');

      if (mobile.matches) {
        html.classList.add('mobile');
      } else if (tablet.matches) {
        html.classList.add('tablet');
      } else if (desktop.matches) {
        html.classList.add('desktop');
      }
    };

    mobile.addEventListener('change', updateClasses);
    tablet.addEventListener('change', updateClasses);
    desktop.addEventListener('change', updateClasses);

    // Initial
    updateClasses();
  }

  private initDarkMode(): void {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateDarkMode = (): void => {
      document.documentElement.classList.toggle('dark-mode', darkQuery.matches);
    };

    darkQuery.addEventListener('change', updateDarkMode);

    // Initial
    updateDarkMode();
  }
}
