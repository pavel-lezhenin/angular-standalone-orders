import { Component, inject, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CategoryDTO } from '@core';
import { DialogComponent, DialogConfig } from '@shared/ui/dialog';

export interface CategoryFormDialogData extends DialogConfig {
  mode: 'create' | 'edit';
  category?: CategoryDTO;
}

/**
 * Category form dialog component
 *
 * Used for creating and editing category records
 */
@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogComponent,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './category-form-dialog.component.html',
  styleUrl: './category-form-dialog.component.scss',
})
export class CategoryFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CategoryFormDialogComponent>);
  protected readonly data = inject<CategoryFormDialogData>(MAT_DIALOG_DATA);
  
  /**
   * Reference to the dialog component
   */
  protected readonly dialog = viewChild.required(DialogComponent);

  /**
   * Form group
   */
  protected form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initialize form
   */
  private initForm(): void {
    this.form = this.fb.group({
      name: [
        this.data.category?.name || '',
        [Validators.required, Validators.maxLength(32)]
      ],
      description: [
        this.data.category?.description || '',
        [Validators.required, Validators.maxLength(128)]
      ],
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
  protected getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }

    if (control.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }

    return '';
  }

  /**
   * Get character count hint for field
   */
  protected getCharacterHint(controlName: string, maxLength: number): string {
    const control = this.form.get(controlName);
    const currentLength = control?.value?.length || 0;
    return `${currentLength}/${maxLength}`;
  }
}
