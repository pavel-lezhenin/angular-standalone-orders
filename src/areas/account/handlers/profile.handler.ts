import { Injectable, inject, signal, computed } from '@angular/core';
import type { FormGroup} from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@shared/services/notification.service';

/**
 * Handles profile-related state and operations for the Account page.
 */
@Injectable()
export class ProfileHandler {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  readonly user = computed(() => this.authService.currentUser());
  readonly isEditMode = signal(false);
  readonly form: FormGroup;

  constructor() {
    const currentUser = this.user();

    this.form = this.fb.group({
      firstName: [currentUser?.profile.firstName ?? '', [Validators.required]],
      lastName: [currentUser?.profile.lastName ?? '', [Validators.required]],
      email: [{ value: currentUser?.email ?? '', disabled: true }],
      phone: [currentUser?.profile.phone ?? ''],
    });
  }

  toggleEditMode(): void {
    this.isEditMode.update(v => !v);

    if (!this.isEditMode()) {
      const currentUser = this.user();
      this.form.patchValue({
        firstName: currentUser?.profile.firstName ?? '',
        lastName: currentUser?.profile.lastName ?? '',
        phone: currentUser?.profile.phone ?? '',
      });
    }
  }

  save(): void {
    if (!this.form.valid) {
      return;
    }
    // TODO: Implement save functionality via service
    this.notification.success('Profile updated');
    this.isEditMode.set(false);
  }

  getRoleBadgeColor(role?: string): 'warn' | 'accent' | 'primary' {
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
