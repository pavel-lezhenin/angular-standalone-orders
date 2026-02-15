import { Component, inject, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { UserRole } from '@core/types';
import { DialogComponent, DialogConfig } from '@shared/ui/dialog';
import { PermissionDTO } from '@core';

export interface PermissionFormDialogData extends DialogConfig {
  mode: 'create' | 'edit';
  permission?: PermissionDTO;
  onSave?: (formValue: {
    role: UserRole;
    section: string;
    action: string;
    granted: boolean;
  }) => Promise<void>;
}

/**
 * Permission form dialog component
 *
 * Used for creating custom permissions
 */
@Component({
  selector: 'app-permission-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatAutocompleteModule,
  ],
  templateUrl: './permission-form-dialog.component.html',
  styleUrl: './permission-form-dialog.component.scss',
})
export class PermissionFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PermissionFormDialogComponent>);
  protected readonly data = inject<PermissionFormDialogData>(MAT_DIALOG_DATA);
  
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

  /**
   * Predefined sections (optional suggestions)
   */
  protected readonly commonSections = [
    'cart',
    'profile',
    'orders_own',
    'orders_all',
    'cancelled_orders',
    'products',
    'categories',
    'customers',
    'permissions',
    'dashboard',
  ];

  /**
   * Predefined actions (optional suggestions)
   */
  protected readonly commonActions = ['view', 'create', 'edit', 'delete', 'crud', 'cancel'];

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initialize form
   */
  private initForm(): void {
    this.form = this.fb.group({
      role: [this.data.permission?.role || 'user', [Validators.required]],
      section: [this.data.permission?.section || '', [Validators.required, Validators.minLength(2)]],
      action: [this.data.permission?.action || '', [Validators.required, Validators.minLength(2)]],
      granted: [this.data.permission?.granted ?? true],
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

    const dialogInstance = this.dialog();

    this.form.disable({ emitEvent: false });
    this.dialogRef.disableClose = true;
    dialogInstance.setLoading(true);

    try {
      const formValue = this.form.getRawValue();

      if (this.data.onSave) {
        await this.data.onSave(formValue);
        this.dialogRef.close({ success: true });
        return;
      }

      this.dialogRef.close({ formValue });
    } catch {
      this.form.enable({ emitEvent: false });
      this.dialogRef.disableClose = false;
      dialogInstance.setLoading(false);
    }
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
  protected getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    
    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required';
    }

    if (control.errors['minLength']) {
      return `Minimum length is ${control.errors['minLength'].requiredLength}`;
    }

    return 'Invalid value';
  }
}
