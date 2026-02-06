import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-page">
      <h1>Welcome to Orders Management</h1>
      <p>Manage your orders efficiently</p>
      <nav>
        <ul>
          <li><a routerLink="/orders">View Orders</a></li>
          <li><a routerLink="/auth">Login</a></li>
        </ul>
      </nav>
    </div>
  `,
  styles: [`
    .home-page {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
    
    nav ul {
      list-style: none;
      padding: 0;
      display: flex;
      gap: 1rem;
    }
    
    nav a {
      padding: 0.5rem 1rem;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
    
    nav a:hover {
      background: #0056b3;
    }
  `],
})
export class HomeComponent {}
