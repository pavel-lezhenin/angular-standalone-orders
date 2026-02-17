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
});
