import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { SectionWrapperComponent } from '../../ui/section-wrapper/section-wrapper.component';

/**
 * FAQ accordion section
 */
@Component({
  selector: 'app-faq-section',
  standalone: true,
  imports: [MatExpansionModule, SectionWrapperComponent],
  templateUrl: './faq-section.component.html',
  styleUrl: './faq-section.component.scss',
})
export class FaqSectionComponent {}
