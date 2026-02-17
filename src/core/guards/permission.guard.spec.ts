import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { permissionGuard } from './permission.guard';
import { PermissionService } from '../services/permission.service';

describe('permissionGuard', () => {
  it('allows navigation when permission service grants access', () => {
    const permissionServiceMock: Pick<PermissionService, 'hasAccess'> = {
      hasAccess: vi.fn(() => true),
    };

    const routerMock: Pick<Router, 'createUrlTree'> = {
      createUrlTree: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: PermissionService, useValue: permissionServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      permissionGuard({ data: { section: 'products', action: 'view' } } as never, {} as never)
    );

    expect(permissionServiceMock.hasAccess).toHaveBeenCalledWith('products', 'view');
    expect(result).toBe(true);
  });

  it('redirects to login when permission is denied', () => {
    const permissionServiceMock: Pick<PermissionService, 'hasAccess'> = {
      hasAccess: vi.fn(() => false),
    };

    const urlTree = { path: '/auth/login' };
    const routerMock: Pick<Router, 'createUrlTree'> = {
      createUrlTree: vi.fn(() => urlTree as never),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: PermissionService, useValue: permissionServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      permissionGuard({ data: { section: 'products', action: 'edit' } } as never, {} as never)
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(result).toBe(urlTree);
  });
});
