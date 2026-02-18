import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { FormGroup} from '@angular/forms';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { FormFieldComponent } from '@shared/ui/form-field/form-field.component';

/**
 * Address Form Component
 * 
 * Reusable form for creating/editing shipping addresses
 */
@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    FormFieldComponent,
  ],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent {
  /**
   * Address form group
   */
  readonly addressForm = input.required<FormGroup>();

  /**
   * Event emitted when form is submitted
   */
  readonly saveAddress = output<void>();

  /**
   * Event emitted when form is cancelled
   */
  readonly cancelAddress = output<void>();

  /**
   * Helper method to get typed FormControl from form group
   */
  getControl(name: string): FormControl {
    const control = this.addressForm().get(name);
    if (!control) {
      console.error(`Control '${name}' not found in address form`);
      return new FormControl();
    }
    return control as FormControl;
  }
}
