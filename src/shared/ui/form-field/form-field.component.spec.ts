import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormFieldComponent } from './form-field.component';

describe('FormFieldComponent', () => {
  let component: FormFieldComponent;
  let fixture: ComponentFixture<FormFieldComponent>;
  let control: FormControl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldComponent, NoopAnimationsModule],
    }).compileComponents();

    control = new FormControl('');
    fixture = TestBed.createComponent(FormFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test Field');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Basic rendering', () => {
    it('should display the label', () => {
      const label = fixture.nativeElement.querySelector('mat-label');
      expect(label.textContent).toBe('Test Field');
    });

    it('should render text input by default', () => {
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
      fixture.componentRef.setInput('customErrorMessages', { required: 'This is mandatory' });
      fixture.detectChanges();

      expect(component.getErrorMessage()).toBe('This is mandatory');
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
