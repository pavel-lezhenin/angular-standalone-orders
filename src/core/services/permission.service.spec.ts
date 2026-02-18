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

  it('deletePermission returns false when id does not exist', () => {
    const removed = service.deletePermission('non-existent-id');

    expect(removed).toBe(false);
  });

  it('updatePermissionStatus returns false when id does not exist', () => {
    const updated = service.updatePermissionStatus('non-existent-id', false);

    expect(updated).toBe(false);
  });

  it('grants built-in permissions for manager role', () => {
    vi.mocked(authServiceMock.getCurrentUser).mockReturnValue({
      ...baseUser,
      role: 'manager',
    });

    expect(service.hasAccess('orders_all', 'view')).toBe(true);
    expect(service.hasAccess('orders_all', 'edit')).toBe(true);
    expect(service.hasAccess('cancelled_orders', 'view')).toBe(true);
    expect(service.hasAccess('products', 'crud')).toBe(true);
    expect(service.hasAccess('categories', 'crud')).toBe(true);
    // Manager doesn't have cart access
    expect(service.hasAccess('cart', 'crud')).toBe(false);
  });

  it('getPermissions returns empty array for unknown role', () => {
    const permissions = service.getPermissions('superuser');

    expect(permissions).toEqual([]);
  });

  it('getPermissions returns empty array for admin role (admin uses hasAccess shortcut)', () => {
    const permissions = service.getPermissions('admin');

    expect(permissions).toEqual([]);
  });

  it('getPermissions returns cached result on subsequent calls', () => {
    vi.mocked(authServiceMock.getCurrentUser).mockReturnValue(baseUser);

    const first = service.getPermissions('user');
    const second = service.getPermissions('user');

    expect(first).toBe(second);
  });

  it('clearCache causes getPermissions to rebuild on next call', () => {
    const first = service.getPermissions('user');

    service.clearCache();

    const second = service.getPermissions('user');

    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });

  it('getCustomPermissions returns a copy of custom permissions', () => {
    service.addPermission({ role: 'user', section: 'wishlist', action: 'view', granted: true });

    const copy = service.getCustomPermissions();
    copy.pop();

    expect(service.getCustomPermissions()).toHaveLength(1);
  });

  it('custom permission with granted: false explicitly blocks access', () => {
    vi.mocked(authServiceMock.getCurrentUser).mockReturnValue(baseUser);

    service.addPermission({
      role: 'user',
      section: 'wishlist',
      action: 'view',
      granted: false,
    });

    expect(service.hasAccess('wishlist', 'view')).toBe(false);
  });

  it('updatePermissionStatus from true to false revokes hasAccess', () => {
    vi.mocked(authServiceMock.getCurrentUser).mockReturnValue(baseUser);

    const permission = service.addPermission({
      role: 'user',
      section: 'wishlist',
      action: 'view',
      granted: true,
    });
    expect(service.hasAccess('wishlist', 'view')).toBe(true);

    service.updatePermissionStatus(permission.id, false);

    expect(service.hasAccess('wishlist', 'view')).toBe(false);
  });

  it('updatePermissionStatus from false to true grants hasAccess', () => {
    vi.mocked(authServiceMock.getCurrentUser).mockReturnValue(baseUser);

    const permission = service.addPermission({
      role: 'user',
      section: 'wishlist',
      action: 'view',
      granted: false,
    });
    expect(service.hasAccess('wishlist', 'view')).toBe(false);

    service.updatePermissionStatus(permission.id, true);

    expect(service.hasAccess('wishlist', 'view')).toBe(true);
  });

  it('deletePermission removes access granted by that permission', () => {
    vi.mocked(authServiceMock.getCurrentUser).mockReturnValue(baseUser);

    const permission = service.addPermission({
      role: 'user',
      section: 'wishlist',
      action: 'view',
      granted: true,
    });
    expect(service.hasAccess('wishlist', 'view')).toBe(true);

    service.deletePermission(permission.id);

    expect(service.hasAccess('wishlist', 'view')).toBe(false);
  });

  it('permissions are cached independently per role', () => {
    const userPerms = service.getPermissions('user');
    const managerPerms = service.getPermissions('manager');

    expect(userPerms).not.toBe(managerPerms);
    expect(userPerms.every((p) => p.role === 'user')).toBe(true);
    expect(managerPerms.every((p) => p.role === 'manager')).toBe(true);
  });
});
