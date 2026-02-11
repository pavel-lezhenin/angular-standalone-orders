import { Injectable, signal } from '@angular/core';
import { NavItem } from '@/shared/models';

/**
 * Service for managing layout state (navigation, title)
 * Used by pages to configure the top bar dynamically
 */
@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  /**
   * Current page title displayed in top bar
   */
  title = signal<string>('Orders Platform');

  /**
   * Navigation items for top bar menu
   */
  navItems = signal<NavItem[]>([]);

  /**
   * Sets the page title
   */
  setTitle(title: string): void {
    this.title.set(title);
  }

  /**
   * Sets navigation items for the top bar
   */
  setNavItems(items: NavItem[]): void {
    this.navItems.set(items);
  }

  /**
   * Resets to default state
   */
  reset(): void {
    this.title.set('Orders Platform');
    this.navItems.set([]);
  }
}
