import { Injectable } from '@angular/core';

/**
 * Service for smooth scrolling to page sections with offset compensation
 */
@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  private readonly ADDITIONAL_OFFSET = 20;

  /**
   * Scrolls smoothly to an element by ID
   * @param sectionId - Element ID to scroll to
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (!element) {
      return;
    }

    const topBar = document.querySelector('.top-bar');
    const topBarHeight = topBar?.getBoundingClientRect().height ?? 64;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - topBarHeight - this.ADDITIONAL_OFFSET;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
}
