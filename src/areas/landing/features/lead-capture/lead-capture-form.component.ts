import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ContactChannel } from './models';

/**
 * Lead capture form with multi-channel contact options
 */
@Component({
  selector: 'app-lead-capture-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './lead-capture-form.component.html',
  styleUrl: './lead-capture-form.component.scss',
})
export class LeadCaptureFormComponent {
  private readonly destroyRef = inject(DestroyRef);

  leadForm: FormGroup;
  selectedChannel: ContactChannel = 'email';

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.leadForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      company: [''],
      channel: ['email', Validators.required],
      channelValue: [''],
      message: [''],
      consent: [false, Validators.requiredTrue],
    });

    // Watch channel changes to update validation
    this.leadForm.get('channel')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((channel: ContactChannel) => {
        this.selectedChannel = channel;
        this.updateChannelValidation(channel);
      });
  }

  onSubmit(): void {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }

    const formData = this.leadForm.value;
    
    // Handle different contact channels
    switch (formData.channel) {
      case 'telegram':
        this.openTelegram(formData.channelValue, formData.message);
        break;
      case 'whatsapp':
        this.openWhatsApp(formData.channelValue, formData.message);
        break;
      case 'phone':
        this.showPhoneMessage(formData.channelValue);
        break;
      default:
        this.submitEmailForm(formData);
    }
  }

  private updateChannelValidation(channel: ContactChannel): void {
    const channelValueControl = this.leadForm.get('channelValue');
    
    if (channel === 'telegram' || channel === 'whatsapp' || channel === 'phone') {
      channelValueControl?.setValidators([Validators.required]);
    } else {
      channelValueControl?.clearValidators();
    }
    
    channelValueControl?.updateValueAndValidity();
  }

  private openTelegram(username: string, message: string): void {
    // Remove @ if user included it
    const cleanUsername = username.replace('@', '');
    const encodedMessage = encodeURIComponent(
      `Hi! I'm ${this.leadForm.get('name')?.value}. ${message || 'I am interested in your order management platform.'}`
    );
    
    window.open(`https://t.me/${cleanUsername}?text=${encodedMessage}`, '_blank');
    this.showSuccessMessage('Opening Telegram...');
    this.leadForm.reset({ channel: 'email', consent: false });
  }

  private openWhatsApp(phone: string, message: string): void {
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(
      `Hi! I'm ${this.leadForm.get('name')?.value} from ${this.leadForm.get('company')?.value || 'my company'}. ${message || 'I am interested in your order management platform.'}`
    );
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
    this.showSuccessMessage('Opening WhatsApp...');
    this.leadForm.reset({ channel: 'email', consent: false });
  }

  private showPhoneMessage(phone: string): void {
    this.snackBar.open(
      `Thank you! We'll call you at ${phone} within 24 hours.`,
      'Close',
      { duration: 6000 }
    );
    this.leadForm.reset({ channel: 'email', consent: false });
  }

  private submitEmailForm(data: unknown): void {
    // TODO: Integrate with backend/CRM
    console.log('Form submitted:', data);
    this.showSuccessMessage('Thank you! We will contact you via email soon.');
    this.leadForm.reset({ channel: 'email', consent: false });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
