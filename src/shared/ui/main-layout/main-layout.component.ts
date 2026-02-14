import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '@/shared/services/layout.service';
import { TopBarComponent } from '../top-bar/top-bar.component';

/**
 * Main application layout wrapper
 * Contains sticky top bar and router outlet for page content
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, TopBarComponent],
  template: `
    <div class="main-layout">
      <app-top-bar 
        [title]="layoutService.title()" 
        [navItems]="layoutService.navItems()" />
      
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .main-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--mat-sys-surface-container);
    }
  `],
})
export class MainLayoutComponent {
  constructor(public layoutService: LayoutService) {}
}
