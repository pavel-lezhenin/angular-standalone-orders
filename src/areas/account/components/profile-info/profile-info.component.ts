import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

/**
 * Profile Information Component
 * 
 * Displays and allows editing of user's personal and contact information
 */
@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.scss',
})
export class ProfileInfoComponent {
  /**
   * Profile form group containing personal and contact fields
   */
  readonly profileForm = input.required<FormGroup>();

  /**
   * Whether form is in edit mode
   */
  readonly isEditMode = input.required<boolean>();
}
