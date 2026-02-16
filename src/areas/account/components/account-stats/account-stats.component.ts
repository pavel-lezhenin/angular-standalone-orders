import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

/**
 * Account Statistics Component
 * 
 * Displays user account statistics
 */
@Component({
  selector: 'app-account-stats',
  standalone: true,
  imports: [MatCardModule, DecimalPipe],
  templateUrl: './account-stats.component.html',
  styleUrl: './account-stats.component.scss',
})
export class AccountStatsComponent {
  /**
   * Total number of orders
   */
  readonly totalOrders = input.required<number>();

  /**
   * Total amount spent
   */
  readonly totalSpent = input.required<number>();

  /**
   * Current loyalty points
   */
  readonly loyaltyPoints = input.required<number>();
}
