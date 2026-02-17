import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import type { AddressDTO } from '@core/models';
import { SavedAddressesManagerComponent } from './saved-addresses-manager.component';

const setSignalInput = (component: SavedAddressesManagerComponent, inputName: string, value: unknown): void => {
  (component as unknown as Record<string, unknown>)[inputName] = signal(value);
};

describe('SavedAddressesManagerComponent', () => {
  let component: SavedAddressesManagerComponent;
  let addressForm: FormGroup;
  let mockAddresses: AddressDTO[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new SavedAddressesManagerComponent());

    const fb = new FormBuilder();
    addressForm = fb.group({
      label: ['', Validators.required],
      recipientName: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      phone: ['', Validators.required],
    });

    mockAddresses = [
      {
        id: '1',
        label: 'Home',
        recipientName: 'John Doe',
        addressLine1: '123 Main St',
        addressLine2: 'Apt 4',
        city: 'New York',
        postalCode: '10001',
        phone: '+1234567890',
        isDefault: true,
      },
    ];

    setSignalInput(component, 'savedAddresses', mockAddresses);
    setSignalInput(component, 'selectedAddressId', '1');
    setSignalInput(component, 'showAddressForm', false);
    setSignalInput(component, 'addressForm', addressForm);
    setSignalInput(component, 'isEditMode', true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should store required inputs', () => {
    expect(component.savedAddresses()).toEqual(mockAddresses);
    expect(component.selectedAddressId()).toBe('1');
    expect(component.addressForm()).toBe(addressForm);
  });

  it('should emit toggleForm event', () => {
    let emitted = false;
    component.toggleForm.subscribe(() => (emitted = true));
    component.toggleForm.emit();
    expect(emitted).toBe(true);
  });

  it('should emit saveAddress event', () => {
    let emitted = false;
    component.saveAddress.subscribe(() => (emitted = true));
    component.saveAddress.emit();
    expect(emitted).toBe(true);
  });

  it('should emit addressSelectionChange event with selected id', () => {
    let emittedValue = '';
    component.addressSelectionChange.subscribe((value) => (emittedValue = value));
    component.addressSelectionChange.emit('1');
    expect(emittedValue).toBe('1');
  });

  it('should emit deleteSelected event', () => {
    let emitted = false;
    component.deleteSelected.subscribe(() => (emitted = true));
    component.deleteSelected.emit();
    expect(emitted).toBe(true);
  });

  it('should emit setAsDefault event', () => {
    let emitted = false;
    component.setAsDefault.subscribe(() => (emitted = true));
    component.setAsDefault.emit();
    expect(emitted).toBe(true);
  });

  it('should emit toggleEditMode event', () => {
    let emitted = false;
    component.toggleEditMode.subscribe(() => (emitted = true));
    component.toggleEditMode.emit();
    expect(emitted).toBe(true);
  });
});
