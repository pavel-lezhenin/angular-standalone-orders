import { Component, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AddressFormComponent } from '../address-form/address-form.component';
import { AddressSelectorComponent } from '../address-selector/address-selector.component';
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
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    AddressFormComponent,
    AddressSelectorComponent,
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
   * Whether the account is in edit mode
   */
  readonly isEditMode = input.required<boolean>();

  /**
   * Emitted when address selection changes
   */
  readonly addressSelectionChange = output<string>();

  /**
   * Emitted when user wants to toggle the address form
   */
  readonly toggleForm = output<void>();

  /**
   * Emitted when user wants to toggle edit mode
   */
  readonly toggleEditMode = output<void>();

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
}
