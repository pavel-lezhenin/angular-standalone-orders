import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { FormGroup} from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { ProfileInfoComponent } from './profile-info.component';

const setSignalInput = (component: ProfileInfoComponent, inputName: string, value: unknown): void => {
  (component as unknown as Record<string, unknown>)[inputName] = signal(value);
};

describe('ProfileInfoComponent', () => {
  let component: ProfileInfoComponent;
  let profileForm: FormGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new ProfileInfoComponent());

    const fb = new FormBuilder();
    profileForm = fb.group({
      firstName: ['John', [Validators.required]],
      lastName: ['Doe', [Validators.required]],
      email: [{ value: 'john@example.com', disabled: true }],
      phone: ['+1234567890'],
    });

    setSignalInput(component, 'profileForm', profileForm);
    setSignalInput(component, 'isEditMode', false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should store profile form input', () => {
    expect(component.profileForm()).toBe(profileForm);
    expect(component.profileForm().controls['firstName']?.value).toBe('John');
  });

  it('should store view mode state', () => {
    expect(component.isEditMode()).toBe(false);
  });

  it('should store edit mode state', () => {
    setSignalInput(component, 'isEditMode', true);
    expect(component.isEditMode()).toBe(true);
  });
});
