import { ChangeDetectionStrategy, Component, input, output, computed, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormFieldComponent } from '@shared/ui/form-field/form-field.component';
import type { SelectOption } from '@shared/ui/form-field/form-field.component';
import type { AddressDTO } from '@core/models';

/**
 * Address Selector Component
 * 
 * Handles address selection, display, and management actions
 */
@Component({
  selector: 'app-address-selector',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    FormFieldComponent,
  ],
  templateUrl: './address-selector.component.html',
  styleUrl: './address-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressSelectorComponent {
  /**
   * List of saved addresses
   */
  readonly savedAddresses = input.required<AddressDTO[]>();

  /**
   * Currently selected address ID
   */
  readonly selectedAddressId = input.required<string>();

  /**
   * Whether the account is in edit mode
   */
  readonly isEditMode = input.required<boolean>();

  /**
   * Event emitted when address selection changes
   */
  readonly selectionChange = output<string>();

  /**
   * Event emitted when "Set as Default" is clicked
   */
  readonly setAsDefault = output<void>();

  /**
   * Event emitted when "Delete" is clicked
   */
  readonly deleteSelected = output<void>();

  /**
   * FormControl for address selection
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
   * Select options computed from saved addresses
   */
  readonly addressOptions = computed<SelectOption[]>(() =>
    this.savedAddresses().map(address => ({
      value: address.id,
      label: address.isDefault ? `${address.label} (Default)` : address.label,
    }))
  );

  /**
   * Whether the selected address can be deleted
   */
  readonly canDeleteSelected = computed(() => {
    if (!this.isEditMode()) return false;
    const address = this.selectedAddress();
    if (!address) return false;
    return !address.isDefault || this.savedAddresses().length > 1;
  });

  /**
   * Whether the selected address can be set as default
   */
  readonly canSetAsDefault = computed(() => {
    if (!this.isEditMode()) return false;
    const address = this.selectedAddress();
    return !!address && !address.isDefault;
  });

  constructor() {
    // Synchronize addressSelectControl with selectedAddressId signal
    effect(() => {
      const addressId = this.selectedAddressId();
      if (this.addressSelectControl.value !== addressId) {
        this.addressSelectControl.setValue(addressId, { emitEvent: false });
      }
    });

    // Subscribe to addressSelectControl changes to emit selection change
    this.addressSelectControl.valueChanges.subscribe((addressId: string | null) => {
      if (addressId && addressId !== this.selectedAddressId()) {
        this.selectionChange.emit(addressId);
      }
    });
  }
}
