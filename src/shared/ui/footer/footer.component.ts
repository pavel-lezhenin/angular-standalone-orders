import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * Footer component with company info, links, and social media
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  openTelegram(): void {
    window.open('https://t.me/orders_platform', '_blank');
  }

  openWhatsApp(): void {
    window.open('https://wa.me/1234567890', '_blank');
  }

  openLinkedIn(): void {
    window.open('https://linkedin.com/company/orders-platform', '_blank');
  }

  openGitHub(): void {
    window.open('https://github.com/orders-platform', '_blank');
  }

  sendEmail(): void {
    window.location.href = 'mailto:info@ordersplatform.com';
  }
}
