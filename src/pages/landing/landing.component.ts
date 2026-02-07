import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule],
  template: `
    <div class="landing-page">
      <mat-card class="hero">
        <mat-card-header>
          <mat-card-title>Orders Management Platform</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Professional order management system with role-based access control</p>
          <div class="actions">
            <a mat-raised-button color="primary" routerLink="/auth/login">
              Get Started
            </a>
            <a mat-button routerLink="/shop">
              Browse Shop
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--app-spacing);
    }

    .hero {
      max-width: 600px;
      text-align: center;
    }

    .actions {
      margin-top: calc(var(--app-spacing) * 2);
      display: flex;
      gap: var(--app-spacing);
      justify-content: center;
    }
  `],
})
export class LandingComponent {}
