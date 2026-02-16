import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SavedAddressesManagerComponent } from './saved-addresses-manager.component';
import type { AddressDTO } from '@core/models';

describe('SavedAddressesManagerComponent', () => {
  let component: SavedAddressesManagerComponent;
  let fixture: ComponentFixture<SavedAddressesManagerComponent>;
  let fb: FormBuilder;
  let mockAddresses: AddressDTO[];
  let addressForm: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedAddressesManagerComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SavedAddressesManagerComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);

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
      {
        id: '2',
        label: 'Work',
        recipientName: 'John Doe',
        addressLine1: '456 Work Ave',
        addressLine2: '',
        city: 'New York',
        postalCode: '10002',
        phone: '+1234567891',
        isDefault: false,
      },
    ];

    addressForm = fb.group({
      label: ['', Validators.required],
      recipientName: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      phone: ['', Validators.required],
    });

    fixture.componentRef.setInput('savedAddresses', mockAddresses);
    fixture.componentRef.setInput('selectedAddressId', '1');
    fixture.componentRef.setInput('showAddressForm', false);
    fixture.componentRef.setInput('addressForm', addressForm);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display saved addresses in selection', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const select = compiled.querySelector('.address-select mat-select');
    expect(select).toBeTruthy();
  });

  it('should compute selectedAddress correctly', () => {
    const selected = component.selectedAddress();
    expect(selected).toBeTruthy();
    expect(selected?.id).toBe('1');
    expect(selected?.label).toBe('Home');
  });

  it('should display selected address details', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const display = compiled.querySelector('.selected-address-display');
    expect(display).toBeTruthy();
    expect(display?.textContent).toContain('Home');
    expect(display?.textContent).toContain('John Doe');
    expect(display?.textContent).toContain('123 Main St');
  });

  it('should show delete button when canDeleteSelected', () => {
    fixture.componentRef.setInput('selectedAddressId', '2');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const deleteButton = compiled.querySelector('button[color="warn"]');
    expect(deleteButton).toBeTruthy();
    expect(component.canDeleteSelected()).toBe(true);
  });

  it('should show "Set as Default" button for non-default addresses', () => {
    fixture.componentRef.setInput('selectedAddressId', '2');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const defaultButton = Array.from(compiled.querySelectorAll('button'))
      .find(btn => btn.textContent?.includes('Set as Default'));
    expect(defaultButton).toBeTruthy();
    expect(component.canSetAsDefault()).toBe(true);
  });

  it('should not show "Set as Default" button for default address', () => {
    fixture.componentRef.setInput('selectedAddressId', '1');
    fixture.detectChanges();

    expect(component.canSetAsDefault()).toBe(false);
  });

  it('should toggle to address form when showAddressForm is true', () => {
    fixture.componentRef.setInput('showAddressForm', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('.address-form');
    const display = compiled.querySelector('.selected-address-display');

    expect(form).toBeTruthy();
    expect(display).toBeFalsy();
  });

  it('should display all address form fields', () => {
    fixture.componentRef.setInput('showAddressForm', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const inputs = compiled.querySelectorAll('mat-form-field');
    expect(inputs.length).toBe(7); // label, recipientName, addressLine1, addressLine2, city, postalCode, phone
  });

  it('should disable save button when form is invalid', () => {
    fixture.componentRef.setInput('showAddressForm', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const saveButton = Array.from(compiled.querySelectorAll('button'))
      .find(btn => btn.textContent?.includes('Save Address')) as HTMLButtonElement;

    expect(saveButton).toBeTruthy();
    expect(saveButton.disabled).toBe(true);
  });

  it('should emit toggleForm when Add/Cancel button clicked', () => {
    let emitted = false;
    component.toggleForm.subscribe(() => {
      emitted = true;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const addButton = compiled.querySelector('.section-header button') as HTMLButtonElement;
    addButton.click();

    expect(emitted).toBe(true);
  });

  it('should emit saveAddress when Save button clicked', () => {
    fixture.componentRef.setInput('showAddressForm', true);
    addressForm.patchValue({
      label: 'Test',
      recipientName: 'Test User',
      addressLine1: '123 Test St',
      city: 'Test City',
      postalCode: '12345',
      phone: '+1234567890',
    });
    fixture.detectChanges();

    let emitted = false;
    component.saveAddress.subscribe(() => {
      emitted = true;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const saveButton = Array.from(compiled.querySelectorAll('button'))
      .find(btn => btn.textContent?.includes('Save Address')) as HTMLButtonElement;
    saveButton.click();

    expect(emitted).toBe(true);
  });
});
