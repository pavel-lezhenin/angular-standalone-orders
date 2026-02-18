import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import type { UserDTO } from '../models';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  const mockUser: UserDTO = {
    id: 'u-1',
    email: 'user@demo',
    role: 'user',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+10000000000',
    },
    createdAt: 1,
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('login stores token and user id, then updates currentUser', async () => {
    const loginPromise = service.login('user@demo', 'demo');

    const req = httpTesting.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'user@demo', password: 'demo' });

    req.flush({ user: mockUser, token: 'test-token' });

    await expect(loginPromise).resolves.toEqual(mockUser);
    expect(service.currentUser()).toEqual(mockUser);
    expect(localStorage.getItem('authToken')).toBe('test-token');
    expect(localStorage.getItem('currentUserId')).toBe('u-1');
  });

  it('logout clears auth storage and currentUser', async () => {
    service.currentUser.set(mockUser);
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('currentUserId', 'u-1');

    const logoutPromise = service.logout();

    const req = httpTesting.expectOne('/api/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush({});

    await expect(logoutPromise).resolves.toBeUndefined();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('currentUserId')).toBeNull();
  });

  it('restoreSession fetches /api/auth/me when userId exists', async () => {
    localStorage.setItem('currentUserId', 'u-1');

    const restorePromise = service.restoreSession();

    const req = httpTesting.expectOne('/api/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush({ user: mockUser });

    await expect(restorePromise).resolves.toBeUndefined();
    expect(service.currentUser()).toEqual(mockUser);
  });

  it('restoreSession does nothing when storage has no user id', async () => {
    await expect(service.restoreSession()).resolves.toBeUndefined();
    httpTesting.expectNone('/api/auth/me');
    expect(service.currentUser()).toBeNull();
  });

  it('login throws when backend response has no user', async () => {
    const loginPromise = service.login('user@demo', 'demo');

    const req = httpTesting.expectOne('/api/auth/login');
    req.flush({ token: 'test-token' });

    await expect(loginPromise).rejects.toThrow('Login failed');
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('currentUserId')).toBeNull();
  });

  it('restoreSession does not set user when response has no user property', async () => {
    localStorage.setItem('currentUserId', 'u-1');

    const restorePromise = service.restoreSession();

    const req = httpTesting.expectOne('/api/auth/me');
    req.flush({}); // response with no user property

    await expect(restorePromise).resolves.toBeUndefined();
    expect(service.currentUser()).toBeNull();
  });

  it('restoreSession clears auth storage when /api/auth/me fails', async () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('currentUserId', 'u-1');

    const restorePromise = service.restoreSession();

    const req = httpTesting.expectOne('/api/auth/me');
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    );

    await expect(restorePromise).resolves.toBeUndefined();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('currentUserId')).toBeNull();
  });

  it('restoreSession in SSR mode does not touch storage and does not call /api/auth/me', async () => {
    localStorage.setItem('currentUserId', 'u-1');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });

    const ssrService = TestBed.inject(AuthService);
    const ssrHttpTesting = TestBed.inject(HttpTestingController);

    await expect(ssrService.restoreSession()).resolves.toBeUndefined();
    ssrHttpTesting.expectNone('/api/auth/me');
    ssrHttpTesting.verify();
  });

  it('login in SSR mode does not write to localStorage', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });

    const ssrService = TestBed.inject(AuthService);
    const ssrHttpTesting = TestBed.inject(HttpTestingController);

    const loginPromise = ssrService.login('user@demo', 'demo');

    const req = ssrHttpTesting.expectOne('/api/auth/login');
    req.flush({ user: mockUser, token: 'ssr-token' });

    await expect(loginPromise).resolves.toEqual(mockUser);
    expect(ssrService.currentUser()).toEqual(mockUser);
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('currentUserId')).toBeNull();

    ssrHttpTesting.verify();
  });

  it('logout in SSR mode does not touch localStorage', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });

    const ssrService = TestBed.inject(AuthService);
    const ssrHttpTesting = TestBed.inject(HttpTestingController);
    ssrService.currentUser.set(mockUser);
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('currentUserId', 'u-1');

    const logoutPromise = ssrService.logout();

    const req = ssrHttpTesting.expectOne('/api/auth/logout');
    req.flush({});

    await expect(logoutPromise).resolves.toBeUndefined();
    expect(ssrService.currentUser()).toBeNull();
    // SSR shouldn't remove from storage — values stay untouched
    expect(localStorage.getItem('authToken')).toBe('test-token');
    expect(localStorage.getItem('currentUserId')).toBe('u-1');

    ssrHttpTesting.verify();
  });

  it('isAuthenticated returns false when no user is set', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('isAuthenticated returns true when user is set', () => {
    service.currentUser.set(mockUser);

    expect(service.isAuthenticated()).toBe(true);
  });

  it('getCurrentUser returns null when not authenticated', () => {
    expect(service.getCurrentUser()).toBeNull();
  });

  it('getCurrentUser returns current user when authenticated', () => {
    service.currentUser.set(mockUser);

    expect(service.getCurrentUser()).toEqual(mockUser);
  });

  it('getRedirectPath returns /auth/login when no user', () => {
    expect(service.getRedirectPath()).toBe('/auth/login');
  });

  it('getRedirectPath returns /admin for admin role', () => {
    service.currentUser.set({ ...mockUser, role: 'admin' });

    expect(service.getRedirectPath()).toBe('/admin');
  });

  it('getRedirectPath returns /admin for manager role', () => {
    service.currentUser.set({ ...mockUser, role: 'manager' });

    expect(service.getRedirectPath()).toBe('/admin');
  });

  it('getRedirectPath returns /shop for user role', () => {
    service.currentUser.set(mockUser);

    expect(service.getRedirectPath()).toBe('/shop');
  });

  it('isAdminOrManager returns false when no user', () => {
    expect(service.isAdminOrManager()).toBe(false);
  });

  it('isAdminOrManager returns true for admin', () => {
    service.currentUser.set({ ...mockUser, role: 'admin' });

    expect(service.isAdminOrManager()).toBe(true);
  });

  it('isAdminOrManager returns true for manager', () => {
    service.currentUser.set({ ...mockUser, role: 'manager' });

    expect(service.isAdminOrManager()).toBe(true);
  });

  it('isAdminOrManager returns false for regular user', () => {
    service.currentUser.set(mockUser);

    expect(service.isAdminOrManager()).toBe(false);
  });

  it('isAdmin returns false when no user', () => {
    expect(service.isAdmin()).toBe(false);
  });

  it('isAdmin returns true for admin role', () => {
    service.currentUser.set({ ...mockUser, role: 'admin' });

    expect(service.isAdmin()).toBe(true);
  });

  it('isAdmin returns false for manager role', () => {
    service.currentUser.set({ ...mockUser, role: 'manager' });

    expect(service.isAdmin()).toBe(false);
  });

  it('isAdmin returns false for user role', () => {
    service.currentUser.set(mockUser);

    expect(service.isAdmin()).toBe(false);
  });
});
