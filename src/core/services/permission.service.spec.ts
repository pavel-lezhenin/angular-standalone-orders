import { TestBed } from '@angular/core/testing';
import { PermissionService } from './permission.service';
import { AuthService } from './auth.service';
import type { UserDTO } from '../models';

describe('PermissionService', () => {
  let service: PermissionService;
  let authServiceMock: Pick<AuthService, 'getCurrentUser'>;

  const baseUser: UserDTO = {
    id: 'user-1',
    email: 'user@example.com',
    role: 'user',
    profile: {
      firstName: 'Test',
      lastName: 'User',
      phone: '+10000000000',
    },
    createdAt: Date.now(),
  };

  beforeEach(() => {
    authServiceMock = {
      getCurrentUser: vi.fn(() => null),
    };

    TestBed.configureTestingModule({
      providers: [
        PermissionService,
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    service = TestBed.inject(PermissionService);
  });

  afterEach(() => {
    service.clearCache();
    vi.restoreAllMocks();
  });

  it('denies access when no user is authenticated', () => {
    const result = service.hasAccess('cart', 'crud');

    expect(result).toBe(false);
  });

  it('grants full access for admin role', () => {
    vi.mocked(authServiceMock.getCurrentUser).mockReturnValue({
      ...baseUser,
      role: 'admin',
    });

    const result = service.hasAccess('any-section', 'any-action');

    expect(result).toBe(true);
  });

  it('grants built-in permissions for user role', () => {
    vi.mocked(authServiceMock.getCurrentUser).mockReturnValue(baseUser);

    expect(service.hasAccess('cart', 'crud')).toBe(true);
    expect(service.hasAccess('orders_own', 'cancel')).toBe(true);
    expect(service.hasAccess('products', 'crud')).toBe(false);
  });

  it('adds custom permission and applies it to access checks', () => {
    vi.mocked(authServiceMock.getCurrentUser).mockReturnValue(baseUser);

    expect(service.hasAccess('wishlist', 'view')).toBe(false);

    service.addPermission({
      role: 'user',
      section: 'wishlist',
      action: 'view',
      granted: true,
    });

    expect(service.hasAccess('wishlist', 'view')).toBe(true);
  });

  it('updates custom permission granted status', () => {
    const permission = service.addPermission({
      role: 'manager',
      section: 'reports',
      action: 'view',
      granted: true,
    });

    const updated = service.updatePermissionStatus(permission.id, false);

    expect(updated).toBe(true);
    expect(service.getCustomPermissions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: permission.id, granted: false }),
      ])
    );
  });

  it('deletes custom permission by id', () => {
    const permission = service.addPermission({
      role: 'manager',
      section: 'reports',
      action: 'view',
      granted: true,
    });

    const removed = service.deletePermission(permission.id);

    expect(removed).toBe(true);
    expect(service.getCustomPermissions()).toHaveLength(0);
  });
});
