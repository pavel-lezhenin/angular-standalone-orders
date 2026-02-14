import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { LayoutService } from '@/shared/services/layout.service';

export interface Order {
  id: string;
  number: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orders-page">
      <h1>Your Orders</h1>
      
      @if (loading()) {
        <p class="loading">Loading orders...</p>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else {
        @if (orders().length === 0) {
          <p class="empty">No orders found</p>
        } @else {
          <table class="orders-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr>
                  <td>{{ order.number }}</td>
                  <td>{{ order.total }}</td>
                  <td><span [class]="'status-' + order.status">{{ order.status }}</span></td>
                  <td>{{ order.createdAt | date }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      }
    </div>
  `,
  styles: [`
    .orders-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      color: #333;
      margin-bottom: 2rem;
    }
    
    .orders-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    
    .orders-table th {
      background: #f5f5f5;
      padding: 1rem;
      text-align: left;
      border-bottom: 2px solid #ddd;
      font-weight: 600;
    }
    
    .orders-table td {
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }
    
    .status-pending {
      background: #fff3cd;
      color: #856404;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    
    .status-processing {
      background: #cfe2ff;
      color: #084298;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    
    .status-shipped {
      background: #d1ecf1;
      color: #0c5460;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    
    .status-delivered {
      background: #d4edda;
      color: #155724;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    
    .empty,
    .loading,
    .error {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    
    .error {
      color: #d32f2f;
    }
  `],
})
export class OrdersComponent implements OnInit {
  orders = signal<Order[]>([
    {
      id: '1',
      number: 'ORD-001',
      total: 99.99,
      status: 'delivered',
      createdAt: new Date('2025-01-15'),
    },
    {
      id: '2',
      number: 'ORD-002',
      total: 149.99,
      status: 'shipped',
      createdAt: new Date('2025-02-01'),
    },
    {
      id: '3',
      number: 'ORD-003',
      total: 299.99,
      status: 'processing',
      createdAt: new Date('2025-02-05'),
    },
  ]);

  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    this.layoutService.setTitle('Orders Platform');
    this.layoutService.setNavItems([]);
  }
}
