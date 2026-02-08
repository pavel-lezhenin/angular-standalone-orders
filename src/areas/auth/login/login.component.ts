import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '@core/services/auth.service';

/**
 * Login form component with email/password authentication.
 * Uses Material Design and Reactive Forms.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Form group with email, password, and rememberMe fields */
  readonly loginForm: FormGroup = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.email],
    ],
    password: [
      '',
      [Validators.required, Validators.minLength(6)],
    ],
    rememberMe: [false],
  });

  /** Loading state during login */
  readonly isLoading = signal(false);

  /** Error message to display */
  readonly errorMessage = signal<string | null>(null);

  /** Password visibility toggle */
  readonly hidePassword = signal(true);

  /**
   * Demo users for development/testing
   */
  readonly demoUsers = [
    { email: 'user@demo', password: 'User123!', role: 'User' },
    { email: 'manager@demo', password: 'Manager123!', role: 'Manager' },
    { email: 'admin@demo', password: 'Admin123!', role: 'Admin' },
  ];

  /**
   * Handles form submission.
   * Validates form, calls auth service, and redirects on success.
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login(email, password);

      // Get return URL from query params or use role-based redirect
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.authService.getRedirectPath();
      await this.router.navigateByUrl(returnUrl);
    } catch (error) {
      this.errorMessage.set(
        'Invalid email or password. Please try again.'
      );
      this.isLoading.set(false);
    }
  }

  /**
   * Quick login with demo credentials.
   * @param email - Demo user email
   * @param password - Demo user password
   */
  async loginAsDemo(email: string, password: string): Promise<void> {
    this.loginForm.patchValue({ email, password });
    await this.onSubmit();
  }

  /**
   * Get error message for email field.
   */
  getEmailError(): string {
    const control = this.loginForm.get('email');
    if (control?.hasError('required')) {
      return 'Email is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  /**
   * Get error message for password field.
   */
  getPasswordError(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) {
      return 'Password is required';
    }
    if (control?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }
}
