import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';
import type { UserDTO } from '../models';

describe('adminGuard', () => {
  it('allows navigation during SSR', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as never, { url: '/admin' } as never)
    );

    expect(result).toBe(true);
  });

  it('allows access for admin and manager users in browser', () => {
    const currentUser = signal<UserDTO | null>({ role: 'admin' } as UserDTO);

    const authServiceMock: Pick<AuthService, 'currentUser'> = {
      currentUser,
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

    const adminResult = TestBed.runInInjectionContext(() =>
      adminGuard({} as never, { url: '/admin' } as never)
    );
    expect(adminResult).toBe(true);

    currentUser.set({ role: 'manager' } as UserDTO);
    const managerResult = TestBed.runInInjectionContext(() =>
      adminGuard({} as never, { url: '/admin' } as never)
    );
    expect(managerResult).toBe(true);
  });

  it('redirects non-admin users to login with returnUrl', () => {
    const currentUser = signal<UserDTO | null>({ role: 'user' } as UserDTO);

    const authServiceMock: Pick<AuthService, 'currentUser'> = {
      currentUser,
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
      adminGuard({} as never, { url: '/admin/orders' } as never)
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/admin/orders' },
    });
    expect(result).toBe(urlTree);
  });
});
