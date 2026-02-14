# Form Validators

Custom form validators for reusable validation logic.

## Usage

```typescript
import { FormValidators } from '@shared/validators';
import { FormBuilder, Validators } from '@angular/forms';

// In component
this.form = this.fb.group({
  phone: ['', [Validators.required, FormValidators.phone]],
  postalCode: ['', [Validators.required, FormValidators.postalCode]],
});
```

## Available Validators

### `FormValidators.phone`

Validates phone number format. Accepts various formats with spaces, dashes, parentheses.

**Valid examples:**
- `+1 (555) 123-4567`
- `555-123-4567`
- `(555) 123-4567`
- `5551234567`
- `+15551234567`

**Requirements:**
- Only digits, spaces, dashes, plus sign, parentheses
- Minimum 10 digits (US standard)
- Maximum 15 digits (E.164 international standard)

**Error object:**
```typescript
{ phone: { value: string, message: string } }
```

### `FormValidators.postalCode`

Validates US postal code format (ZIP and ZIP+4).

**Valid examples:**
- `12345` (5-digit ZIP)
- `12345-6789` (ZIP+4)

**Error object:**
```typescript
{ postalCode: { value: string, message: string } }
```

## Template Error Messages

```html
@if (form.get('phone')?.hasError('phone')) {
  <mat-error>{{ form.get('phone')?.errors?.['phone']?.message }}</mat-error>
}

@if (form.get('postalCode')?.hasError('postalCode')) {
  <mat-error>{{ form.get('postalCode')?.errors?.['postalCode']?.message }}</mat-error>
}
```

## Adding New Validators

Create static methods in `FormValidators` class:

```typescript
static customValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null; // Don't validate empty values
  }

  // Validation logic
  if (invalid) {
    return { 
      customValidator: { 
        value: control.value, 
        message: 'Custom error message' 
      } 
    };
  }

  return null;
}
```
