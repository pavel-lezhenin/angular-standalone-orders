import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { UserMenuComponent } from './user-menu.component';
import { AuthService } from '@core/services/auth.service';
import { signal } from '@angular/core';

const mockAuthServiceGuest = {
  isAuthenticated: signal(false),
  currentUser: signal(null),
  logout: () => {},
};

const mockAuthServiceUser = {
  isAuthenticated: signal(true),
  currentUser: signal({ id: '1', email: 'user@example.com', role: 'user' }),
  logout: () => {},
};

const mockAuthServiceAdmin = {
  isAuthenticated: signal(true),
  currentUser: signal({ id: '2', email: 'admin@example.com', role: 'admin' }),
  logout: () => {},
};

const mockAuthServiceManager = {
  isAuthenticated: signal(true),
  currentUser: signal({ id: '3', email: 'manager@example.com', role: 'manager' }),
  logout: () => {},
};

const meta: Meta<UserMenuComponent> = {
  title: 'Shared/UI/UserMenu',
  component: UserMenuComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<UserMenuComponent>;

export const Guest: Story = {
  decorators: [
    applicationConfig({
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuthServiceGuest }],
    }),
  ],
};

export const AuthenticatedUser: Story = {
  decorators: [
    applicationConfig({
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuthServiceUser }],
    }),
  ],
};

export const AuthenticatedAdmin: Story = {
  decorators: [
    applicationConfig({
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuthServiceAdmin }],
    }),
  ],
};

export const AuthenticatedManager: Story = {
  decorators: [
    applicationConfig({
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuthServiceManager }],
    }),
  ],
};
