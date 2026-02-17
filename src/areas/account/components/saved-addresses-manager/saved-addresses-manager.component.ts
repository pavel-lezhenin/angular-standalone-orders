import { Component, input, output, computed, effect } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormFieldComponent } from '@shared/ui/form-field/form-field.component';
import type { AddressDTO } from '@core/models';

/**
 * Saved Addresses Manager Component
 * 
 * Manages user's saved shipping addresses with selection, addition, and deletion
 */
@Component({
  selector: 'app-saved-addresses-manager',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    FormFieldComponent,
  ],
  templateUrl: './saved-addresses-manager.component.html',
  styleUrl: './saved-addresses-manager.component.scss',
})
export class SavedAddressesManagerComponent {
  /**
   * List of saved addresses
   */
  readonly savedAddresses = input.required<AddressDTO[]>();

  /**
   * Currently selected address ID
   */
  readonly selectedAddressId = input.required<string>();

  /**
   * Whether to show the add address form
   */
  readonly showAddressForm = input.required<boolean>();

  /**
   * Address form group
   */
  readonly addressForm = input.required<FormGroup>();

  /**
   * FormControl for address selection (wrapper for app-form-field)
   */
  readonly addressSelectControl = new FormControl('');

  /**
   * Selected address computed from ID
   */
  readonly selectedAddress = computed(() => {
    const addresses = this.savedAddresses();
    return addresses.find(address => address.id === this.selectedAddressId()) ?? null;
  });

  /**
   * Whether the selected address can be deleted
   */
  readonly canDeleteSelected = computed(() => {
    const address = this.selectedAddress();
    if (!address) return false;
    return !address.isDefault || this.savedAddresses().length > 1;
  });

  /**
   * Whether the selected address can be set as default
   */
  readonly canSetAsDefault = computed(() => {
    const address = this.selectedAddress();
    return !!address && !address.isDefault;
  });

  /**
   * Emitted when address selection changes
   */
  readonly addressSelectionChange = output<string>();

  /**
   * Emitted when user wants to toggle the address form
   */
  readonly toggleForm = output<void>();

  /**
   * Emitted when user wants to save a new address
   */
  readonly saveAddress = output<void>();

  /**
   * Emitted when user wants to delete selected address
   */
  readonly deleteSelected = output<void>();

  /**
   * Emitted when user wants to set selected address as default
   */
  readonly setAsDefault = output<void>();

  constructor() {
    // Sync address selection with input signal
    effect(() => {
      const selectedId = this.selectedAddressId();
      this.addressSelectControl.setValue(selectedId, { emitEvent: false });
    });

    // Emit change when FormControl value changes
    effect(() => {
      const control = this.addressSelectControl;
      control.valueChanges.subscribe(value => {
        if (value) {
          this.addressSelectionChange.emit(value);
        }
      });
    }, { allowSignalWrites: false });
  }
}
