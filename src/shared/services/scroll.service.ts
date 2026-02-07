import { Injectable } from '@angular/core';

/**
 * Service for smooth scrolling to page sections with offset compensation
 */
@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  private readonly TOP_BAR_HEIGHT = 64;

  /**
   * Scrolls smoothly to an element by ID
   * @param sectionId - Element ID to scroll to
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (!element) {
      console.warn(`Section with ID "${sectionId}" not found`);
      return;
    }

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - this.TOP_BAR_HEIGHT;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
}
