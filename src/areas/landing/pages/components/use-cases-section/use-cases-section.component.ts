import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SectionWrapperComponent } from '../../ui/section-wrapper/section-wrapper.component';

/**
 * Use cases showcase grid
 */
@Component({
  selector: 'app-use-cases-section',
  standalone: true,
  imports: [MatIconModule, SectionWrapperComponent],
  templateUrl: './use-cases-section.component.html',
  styleUrl: './use-cases-section.component.scss',
})
export class UseCasesSectionComponent {}
