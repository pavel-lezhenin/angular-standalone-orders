import { ChangeDetectionStrategy, Component, inject, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CategoryDTO } from '@core';
import { DialogComponent, DialogConfig } from '@shared/ui/dialog';
import { FormFieldComponent } from '@shared/ui';

export interface CategoryFormDialogData extends DialogConfig {
  mode: 'create' | 'edit';
  category?: CategoryDTO;
  onSave?: (formValue: {
    name: string;
    description: string;
  }) => Promise<void>;
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
    FormFieldComponent,
  ],
  templateUrl: './category-form-dialog.component.html',
  styleUrl: './category-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
   * Get form control as FormControl
   */
  protected getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }
}
