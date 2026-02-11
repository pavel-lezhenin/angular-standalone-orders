import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SectionWrapperComponent } from '../../ui/section-wrapper/section-wrapper.component';

/**
 * Features showcase grid
 */
@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [MatCardModule, MatIconModule, SectionWrapperComponent],
  templateUrl: './features-section.component.html',
  styleUrl: './features-section.component.scss',
})
export class FeaturesSectionComponent {}
