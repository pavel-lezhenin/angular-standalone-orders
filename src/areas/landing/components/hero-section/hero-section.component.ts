import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SectionWrapperComponent } from '../../ui/section-wrapper/section-wrapper.component';

/**
 * Hero banner with CTA buttons
 */
@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, SectionWrapperComponent],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent {
  @Output() ctaClick = new EventEmitter<string>();

  onGetStarted(): void {
    this.ctaClick.emit('contact');
  }

  onRequestDemo(): void {
    this.ctaClick.emit('contact');
  }
}
