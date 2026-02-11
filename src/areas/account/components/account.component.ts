import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '@core/services/auth.service';

/**
 * Account/Profile page for managing user information
 */
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  readonly user = computed(() => this.authService.currentUser());
  readonly isEditMode = signal(false);
  
  profileForm: FormGroup;
  
  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    const currentUser = this.user();
    this.profileForm = this.fb.group({
      firstName: [currentUser?.profile.firstName ?? '', [Validators.required]],
      lastName: [currentUser?.profile.lastName ?? '', [Validators.required]],
      email: [{ value: currentUser?.email ?? '', disabled: true }],
      phone: [currentUser?.profile.phone ?? ''],
    });
  }

  toggleEditMode(): void {
    this.isEditMode.update(v => !v);
    
    if (!this.isEditMode()) {
      // Reset form if canceling edit
      const currentUser = this.user();
      this.profileForm.patchValue({
        firstName: currentUser?.profile.firstName ?? '',
        lastName: currentUser?.profile.lastName ?? '',
        phone: currentUser?.profile.phone ?? '',
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      // TODO: Implement save functionality
      console.log('Saving profile:', this.profileForm.value);
      this.isEditMode.set(false);
    }
  }

  getRoleBadgeColor(role?: string): string {
    switch (role) {
      case 'admin':
        return 'warn';
      case 'manager':
        return 'accent';
      default:
        return 'primary';
    }
  }

  getRoleDisplayName(role?: string): string {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
  }
}
