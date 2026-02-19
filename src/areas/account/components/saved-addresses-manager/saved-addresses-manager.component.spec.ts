import { NO_ERRORS_SCHEMA } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type { FormGroup } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import type { AddressDTO } from '@core/models';
import { SavedAddressesManagerComponent } from './saved-addresses-manager.component';

describe('SavedAddressesManagerComponent', () => {
  let component: SavedAddressesManagerComponent;
  let fixture: ComponentFixture<SavedAddressesManagerComponent>;
  let addressForm: FormGroup;
  let mockAddresses: AddressDTO[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedAddressesManagerComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SavedAddressesManagerComponent);
    component = fixture.componentInstance;

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

    fixture.componentRef.setInput('savedAddresses', mockAddresses);
    fixture.componentRef.setInput('selectedAddressId', '1');
    fixture.componentRef.setInput('showAddressForm', false);
    fixture.componentRef.setInput('addressForm', addressForm);
    fixture.componentRef.setInput('isEditMode', true);
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
