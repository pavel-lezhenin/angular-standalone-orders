import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { UserMenuComponent } from './user-menu.component';

describe('UserMenuComponent', () => {
  let fixture: ComponentFixture<UserMenuComponent>;
  let component: UserMenuComponent;
  let router: Router;

  const currentUserSignal = signal<{ id: string; role: string } | null>(null);
  const logoutMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMenuComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser: currentUserSignal,
            logout: logoutMock,
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── getUserDisplayName ───────────────────────────────────────────────────

  it('getUserDisplayName returns "Admin" for admin role', () => {
    expect(component.getUserDisplayName('admin')).toBe('Admin');
  });

  it('getUserDisplayName returns "Manager" for manager role', () => {
    expect(component.getUserDisplayName('manager')).toBe('Manager');
  });

  it('getUserDisplayName returns "User" for user role', () => {
    expect(component.getUserDisplayName('user')).toBe('User');
  });

  it('getUserDisplayName returns "User" for unknown/undefined role', () => {
    expect(component.getUserDisplayName()).toBe('User');
    expect(component.getUserDisplayName('guest')).toBe('User');
  });

  // ─── navigateTo ──────────────────────────────────────────────────────────

  it('navigateTo routes to the given path', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.navigateTo('/orders');
    expect(spy).toHaveBeenCalledWith(['/orders']);
  });

  // ─── logout ──────────────────────────────────────────────────────────────

  it('logout calls authService.logout and navigates to root', async () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    await component.logout();
    expect(logoutMock).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(['/']);
  });
});
