import { ChangeDetectionStrategy, Component, OnInit, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { LayoutService } from '@/shared/services/layout.service';
import { PageLoaderComponent } from '@shared/ui/page-loader/page-loader.component';
import { ProfileInfoComponent } from './components/profile-info/profile-info.component';
import { SavedAddressesManagerComponent } from './components/saved-addresses-manager/saved-addresses-manager.component';
import { SavedPaymentMethodsManagerComponent } from './components/saved-payment-methods-manager/saved-payment-methods-manager.component';
import { AccountStatsComponent } from './components/account-stats/account-stats.component';
import { ProfileHandler, AddressHandler, PaymentMethodHandler } from './handlers';

/**
 * Account/Profile page for managing user information.
 * Delegates domain logic to dedicated handlers.
 */
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    PageLoaderComponent,
    ProfileInfoComponent,
    SavedAddressesManagerComponent,
    SavedPaymentMethodsManagerComponent,
    AccountStatsComponent,
  ],
  providers: [ProfileHandler, AddressHandler, PaymentMethodHandler],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent implements OnInit {

  readonly profile = inject(ProfileHandler);
  readonly addresses = inject(AddressHandler);
  readonly payments = inject(PaymentMethodHandler);

  readonly user = this.profile.user;
  readonly isLoading = signal(true);

  // Stats (TODO: implement from service)
  readonly totalOrders = computed(() => 0);
  readonly totalSpent = computed(() => 0);
  readonly loyaltyPoints = computed(() => 0);

  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private layoutService: LayoutService) {
    this.layoutService.setTitle('My Account - Orders Platform');
    this.layoutService.setNavItems([]);
  }

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      if (!this.user()) {
        this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/account' } });
        return;
      }

      await Promise.all([
        this.addresses.load(),
        this.payments.load(),
      ]);
    } finally {
      this.isLoading.set(false);
    }
  }
}
