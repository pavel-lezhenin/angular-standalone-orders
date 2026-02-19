import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { FormFieldComponent } from './form-field.component';

describe('FormFieldComponent', () => {
  let component: FormFieldComponent;
  let fixture: ComponentFixture<FormFieldComponent>;
  let control: FormControl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldComponent],
    }).compileComponents();

    control = new FormControl('');
    fixture = TestBed.createComponent(FormFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test Field');
    fixture.componentRef.setInput('control', control);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Basic rendering', () => {
    it('should display the label', () => {
      fixture.detectChanges();
      const label = fixture.nativeElement.querySelector('mat-label');
      expect(label.textContent).toBe('Test Field');
    });

    it('should render text input by default', () => {
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input[type="text"]');
      expect(input).toBeTruthy();
    });

    it('should render textarea when type is textarea', () => {
      fixture.componentRef.setInput('type', 'textarea');
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea).toBeTruthy();
    });

    it('should render select when type is select', () => {
      fixture.componentRef.setInput('type', 'select');
      fixture.detectChanges();
      const select = fixture.nativeElement.querySelector('mat-select');
      expect(select).toBeTruthy();
    });
  });

  describe('Icons', () => {
    it('should display prefix icon when provided', () => {
      fixture.componentRef.setInput('prefixIcon', 'email');
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('mat-icon[matPrefix]');
      expect(icon).toBeTruthy();
      expect(icon.textContent.trim()).toBe('email');
    });

    it('should display suffix icon when provided', () => {
      fixture.componentRef.setInput('suffixIcon', 'visibility');
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('mat-icon[matSuffix]');
      expect(icon).toBeTruthy();
      expect(icon.textContent.trim()).toBe('visibility');
    });
  });

  describe('Validation', () => {
    it('should show required error message', () => {
      control.setValidators([Validators.required]);
      control.markAsTouched();
      control.updateValueAndValidity();
      fixture.detectChanges();

      expect(component.getErrorMessage()).toBe('Test Field is required');
    });

    it('should show email error message', () => {
      control.setValidators([Validators.email]);
      control.setValue('invalid-email');
      control.markAsTouched();
      fixture.detectChanges();

      expect(component.getErrorMessage()).toBe('Enter a valid email address');
    });

    it('should show minlength error message', () => {
      control.setValidators([Validators.minLength(5)]);
      control.setValue('abc');
      control.markAsTouched();
      fixture.detectChanges();

      expect(component.getErrorMessage()).toBe('Minimum 5 characters required');
    });

    it('should show maxlength error message', () => {
      control.setValidators([Validators.maxLength(10)]);
      control.setValue('12345678901');
      control.markAsTouched();
      fixture.detectChanges();

      expect(component.getErrorMessage()).toBe('Maximum 10 characters allowed');
    });

    it('should use custom error message when provided', () => {
      control.setValidators([Validators.required]);
      control.markAsTouched();
      control.updateValueAndValidity();
      fixture.componentRef.setInput('customErrorMessages', { required: 'This is mandatory' });
      fixture.detectChanges();

      expect(component.getErrorMessage()).toBe('This is mandatory');
    });

    it('should show min error message', () => {
      control.setValidators([Validators.min(10)]);
      control.setValue(5);
      control.markAsTouched();
      fixture.detectChanges();
      expect(component.getErrorMessage()).toBe('Value must be at least 10');
    });

    it('should show max error message', () => {
      control.setValidators([Validators.max(5)]);
      control.setValue(10);
      control.markAsTouched();
      fixture.detectChanges();
      expect(component.getErrorMessage()).toBe('Value must be at most 5');
    });

    it('should show "Invalid format" for pattern error', () => {
      control.setValidators([Validators.pattern(/^\d+$/)]);
      control.setValue('abc');
      control.markAsTouched();
      fixture.detectChanges();
      expect(component.getErrorMessage()).toBe('Invalid format');
    });

    it('should show generic "Invalid value" for unknown error', () => {
      fixture.detectChanges();
      control.setErrors({ customError: true });
      control.markAsTouched();
      expect(component.getErrorMessage()).toBe('Invalid value');
    });

    it('should return empty string when control has no errors', () => {
      expect(component.getErrorMessage()).toBe('');
    });
  });

  describe('Event handlers', () => {
    it('onInputChange updates control value and emits inputChange', () => {
      fixture.detectChanges();
      const inputEl = document.createElement('input');
      inputEl.value = 'new value';
      const event = { target: inputEl } as unknown as Event;

      let emittedEvent: Event | undefined;
      const sub = component.inputChange.subscribe((e) => {
        emittedEvent = e;
      });
      component.onInputChange(event);
      expect(control.value).toBe('new value');
      expect(emittedEvent).toBe(event);
      sub.unsubscribe();
    });

    it('onBlur marks control as touched', () => {
      fixture.detectChanges();
      component.onBlur();
      expect(control.touched).toBe(true);
    });

    it('onSelectionChange updates control value and marks it touched', () => {
      fixture.detectChanges();
      component.onSelectionChange('option-1');
      expect(control.value).toBe('option-1');
      expect(control.touched).toBe(true);
    });
  });

  describe('Character count', () => {
    it('should display character count when enabled', () => {
      fixture.componentRef.setInput('maxLength', 100);
      fixture.componentRef.setInput('showCharacterCount', true);
      control.setValue('Hello');
      fixture.detectChanges();

      expect(component.characterCountText()).toBe('5/100');
    });

    it('should update character count when value changes', () => {
      fixture.componentRef.setInput('maxLength', 50);
      fixture.componentRef.setInput('showCharacterCount', true);
      control.setValue('Test');
      fixture.detectChanges();
      expect(component.characterCountText()).toBe('4/50');

      control.setValue('Test message');
      fixture.detectChanges();
      expect(component.characterCountText()).toBe('12/50');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label from label by default', () => {
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-label')).toBe('Test Field');
    });

    it('should use custom aria-label when provided', () => {
      fixture.componentRef.setInput('ariaLabel', 'Custom label');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-label')).toBe('Custom label');
    });

    it('should mark field as required when required is true', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.hasAttribute('required')).toBe(true);
    });
  });
});
