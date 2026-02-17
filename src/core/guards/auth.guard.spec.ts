import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  it('allows navigation during SSR', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/admin' } as never)
    );

    expect(result).toBe(true);
  });

  it('allows navigation for authenticated browser user', () => {
    const authServiceMock: Pick<AuthService, 'isAuthenticated'> = {
      isAuthenticated: vi.fn(() => true),
    };

    const routerMock: Pick<Router, 'createUrlTree'> = {
      createUrlTree: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/orders' } as never)
    );

    expect(result).toBe(true);
  });

  it('redirects unauthenticated browser user to login with returnUrl', () => {
    const authServiceMock: Pick<AuthService, 'isAuthenticated'> = {
      isAuthenticated: vi.fn(() => false),
    };

    const urlTree = { path: '/auth/login' };
    const routerMock: Pick<Router, 'createUrlTree'> = {
      createUrlTree: vi.fn(() => urlTree as never),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/orders' } as never)
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/orders' },
    });
    expect(result).toBe(urlTree);
  });
});
