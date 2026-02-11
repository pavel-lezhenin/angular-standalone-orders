import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { UserDTO } from '@core';
import { UserRole } from '@core/types';
import { DialogComponent, DialogConfig } from '@shared/ui/dialog';

export interface CustomerFormDialogData extends DialogConfig {
  mode: 'create' | 'edit';
  user?: UserDTO;
}

/**
 * Customer form dialog component
 *
 * Used for creating and editing customer records
 */
@Component({
  selector: 'app-customer-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './customer-form-dialog.component.html',
  styleUrl: './customer-form-dialog.component.scss',
})
export class CustomerFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CustomerFormDialogComponent>);
  protected readonly data = inject<CustomerFormDialogData>(MAT_DIALOG_DATA);
  
  /**
   * Reference to the dialog component
   */
  protected readonly dialog = viewChild.required(DialogComponent);

  /**
   * Form group
   */
  protected form!: FormGroup;

  /**
   * Available roles
   */
  protected readonly roles: UserRole[] = ['user', 'manager', 'admin'];

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initialize form
   */
  private initForm(): void {
    this.form = this.fb.group({
      email: [this.data.user?.email || '', [Validators.required, Validators.email]],
      password: [
        '',
        this.data.mode === 'create' ? [Validators.required, Validators.minLength(4)] : [],
      ],
      role: [this.data.user?.role || 'user', [Validators.required]],
      firstName: [this.data.user?.profile?.firstName || '', [Validators.required]],
      lastName: [this.data.user?.profile?.lastName || '', [Validators.required]],
      phone: [this.data.user?.profile?.phone || '', [Validators.required]],
      address: [this.data.user?.profile?.address || '', [Validators.required]],
    });
  }

  /**
   * Handle form submission
   */
  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Close dialog with form data
    this.dialogRef.close({ formValue: this.form.value });
  }

  /**
   * Handle cancel - handled by DialogComponent
   */
  protected onCancel(): void {
    // DialogComponent handles closing
  }

  /**
   * Get form control error message
   */
  protected getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required';
    }
    if (control.errors['email']) {
      return 'Invalid email address';
    }
    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength}`;
    }

    return 'Invalid value';
  }
}
