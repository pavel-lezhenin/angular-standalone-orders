import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface DashboardStat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  stats: DashboardStat[] = [
    { label: 'Total Orders', value: 0, icon: 'shopping_cart', color: 'primary' },
    { label: 'Total Products', value: 0, icon: 'inventory_2', color: 'success' },
    { label: 'Total Customers', value: 0, icon: 'people', color: 'warning' },
    { label: 'Total Revenue', value: '$0', icon: 'attach_money', color: 'info' },
  ];
}
