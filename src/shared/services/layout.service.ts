import { Injectable, signal } from '@angular/core';
import { NavItem } from '@/shared/models';

/**
 * Service for managing layout state (navigation, title)
 * Used by pages to configure the top bar dynamically.
 * Nav items are used only for page-specific links (e.g. Landing scroll sections).
 * App-wide navigation (Shop, Orders, Account) lives in UserMenuComponent dropdown.
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
   * Navigation items for top bar menu.
   * Empty by default — only Landing sets custom scroll links here.
   * App-wide nav links live in UserMenuComponent dropdown.
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
