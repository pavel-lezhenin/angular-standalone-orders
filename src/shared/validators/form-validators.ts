import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom form validators
 * 
 * Provides reusable validation logic for common form fields
 */
export class FormValidators {
  /**
   * Validates phone number format
   * 
   * Accepts formats:
   * - +1 (555) 123-4567
   * - 555-123-4567
   * - (555) 123-4567
   * - 5551234567
   * - +15551234567
   * 
   * @returns ValidationErrors if invalid, null if valid
   */
  static phone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Don't validate empty values (use Validators.required for that)
    }

    const phonePattern = /^[\d\s\-+()]+$/;
    const digitsOnly = control.value.replace(/[\s\-+()]/g, '');

    // Check if contains only valid characters
    if (!phonePattern.test(control.value)) {
      return { phone: { value: control.value, message: 'Phone contains invalid characters' } };
    }

    // Check if has minimum 10 digits (US standard)
    if (digitsOnly.length < 10) {
      return { phone: { value: control.value, message: 'Phone must have at least 10 digits' } };
    }

    // Check if has maximum 15 digits (E.164 international standard)
    if (digitsOnly.length > 15) {
      return { phone: { value: control.value, message: 'Phone must not exceed 15 digits' } };
    }

    return null;
  }

  /**
   * Validates US postal code format
   * 
   * Accepts formats:
   * - 12345 (5-digit ZIP)
   * - 12345-6789 (ZIP+4)
   * 
   * @returns ValidationErrors if invalid, null if valid
   */
  static postalCode(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Don't validate empty values (use Validators.required for that)
    }

    const postalCodePattern = /^\d{5}(-\d{4})?$/;

    if (!postalCodePattern.test(control.value)) {
      return { 
        postalCode: { 
          value: control.value, 
          message: 'Postal code must be in format 12345 or 12345-6789' 
        } 
      };
    }

    return null;
  }

  /**
   * Creates a validator function for phone numbers
   * (Functional style alternative to static method)
   */
  static phoneValidator(): ValidatorFn {
    return FormValidators.phone;
  }

  /**
   * Creates a validator function for postal codes
   * (Functional style alternative to static method)
   */
  static postalCodeValidator(): ValidatorFn {
    return FormValidators.postalCode;
  }
}
