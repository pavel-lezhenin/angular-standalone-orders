import { Component } from '@angular/core';
import { LeadCaptureFormComponent } from '@/areas/landing/features/lead-capture/lead-capture-form.component';
import { SectionWrapperComponent } from '../../ui/section-wrapper/section-wrapper.component';

/**
 * Contact section with lead capture form
 */
@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [LeadCaptureFormComponent, SectionWrapperComponent],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.scss',
})
export class ContactSectionComponent {}
