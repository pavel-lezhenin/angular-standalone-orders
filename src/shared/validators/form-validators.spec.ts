import { FormControl } from '@angular/forms';
import { FormValidators } from './form-validators';

describe('FormValidators', () => {
  // ─── phone ───────────────────────────────────────────────────────────────

  describe('phone()', () => {
    it('returns null for empty value', () => {
      const ctrl = new FormControl('');
      expect(FormValidators.phone(ctrl)).toBeNull();
    });

    it('accepts a valid US phone with country code', () => {
      const ctrl = new FormControl('+15551234567');
      expect(FormValidators.phone(ctrl)).toBeNull();
    });

    it('accepts a formatted phone number', () => {
      const ctrl = new FormControl('+1 (555) 123-4567');
      expect(FormValidators.phone(ctrl)).toBeNull();
    });

    it('accepts a 10-digit phone without formatting', () => {
      const ctrl = new FormControl('5551234567');
      expect(FormValidators.phone(ctrl)).toBeNull();
    });

    it('accepts a dashed phone number', () => {
      const ctrl = new FormControl('555-123-4567');
      expect(FormValidators.phone(ctrl)).toBeNull();
    });

    it('rejects a phone with invalid characters', () => {
      const ctrl = new FormControl('abc1234567');
      const err = FormValidators.phone(ctrl);
      expect(err).not.toBeNull();
      expect(err!['phone'].message).toContain('invalid characters');
    });

    it('rejects a phone with fewer than 10 digits', () => {
      const ctrl = new FormControl('12345');
      const err = FormValidators.phone(ctrl);
      expect(err).not.toBeNull();
      expect(err!['phone'].message).toContain('at least 10 digits');
    });

    it('rejects a phone with more than 15 digits', () => {
      const ctrl = new FormControl('1234567890123456'); // 16 digits
      const err = FormValidators.phone(ctrl);
      expect(err).not.toBeNull();
      expect(err!['phone'].message).toContain('not exceed 15 digits');
    });
  });

  // ─── postalCode ───────────────────────────────────────────────────────────

  describe('postalCode()', () => {
    it('returns null for empty value', () => {
      const ctrl = new FormControl('');
      expect(FormValidators.postalCode(ctrl)).toBeNull();
    });

    it('accepts a 5-digit ZIP code', () => {
      const ctrl = new FormControl('12345');
      expect(FormValidators.postalCode(ctrl)).toBeNull();
    });

    it('accepts a ZIP+4 code', () => {
      const ctrl = new FormControl('12345-6789');
      expect(FormValidators.postalCode(ctrl)).toBeNull();
    });

    it('rejects a 4-digit postal code', () => {
      const ctrl = new FormControl('1234');
      const err = FormValidators.postalCode(ctrl);
      expect(err).not.toBeNull();
      expect(err!['postalCode'].message).toContain('12345 or 12345-6789');
    });

    it('rejects a postal code with letters', () => {
      const ctrl = new FormControl('ABCDE');
      const err = FormValidators.postalCode(ctrl);
      expect(err).not.toBeNull();
    });

    it('rejects a ZIP+4 with wrong separator', () => {
      const ctrl = new FormControl('12345 6789');
      expect(FormValidators.postalCode(ctrl)).not.toBeNull();
    });
  });

  // ─── factory methods ──────────────────────────────────────────────────────

  describe('phoneValidator()', () => {
    it('returns a validator function equivalent to phone()', () => {
      const validator = FormValidators.phoneValidator();
      const ctrl = new FormControl('abc');
      expect(validator(ctrl)).not.toBeNull();
    });

    it('returns null for valid phone via factory validator', () => {
      const validator = FormValidators.phoneValidator();
      const ctrl = new FormControl('5551234567');
      expect(validator(ctrl)).toBeNull();
    });
  });

  describe('postalCodeValidator()', () => {
    it('returns a validator function equivalent to postalCode()', () => {
      const validator = FormValidators.postalCodeValidator();
      const ctrl = new FormControl('ABCDE');
      expect(validator(ctrl)).not.toBeNull();
    });

    it('returns null for valid postal code via factory validator', () => {
      const validator = FormValidators.postalCodeValidator();
      const ctrl = new FormControl('12345');
      expect(validator(ctrl)).toBeNull();
    });
  });
});
