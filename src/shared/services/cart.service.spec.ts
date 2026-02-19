import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { CartService } from './cart.service';
import { AuthService } from '@core/services/auth.service';
import type { CartItemDTO } from '@core/models/cart.dto';

const makeItem = (productId: string, quantity = 1): CartItemDTO => ({
  productId,
  quantity,
  price: 10,
  name: `Product ${productId}`,
});

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  let currentUserSignal: ReturnType<typeof signal<{ id: string; role: string } | null>>;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    currentUserSignal = signal<{ id: string; role: string } | null>(null);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            currentUser: currentUserSignal,
          },
        },
      ],
    });

    localStorage.clear();
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);

    // Flush initial restoreCart for unauthenticated user (no HTTP needed)
    httpMock.verify();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ─── Guest cart restore on init ─────────────────────────────────────────

  it('initializes with empty cart for guest user', () => {
    expect(service.getItems()).toEqual([]);
    expect(service.itemCount()).toBe(0);
  });

  it('restores guest cart from localStorage on init', () => {
    const items = [makeItem('p1', 2)];
    localStorage.setItem('guest_cart', JSON.stringify(items));

    // Re-create service so it reads localStorage on init
    const freshService = TestBed.runInInjectionContext(() => new CartService());
    expect(freshService.getItems()).toHaveLength(1);
    expect(freshService.getItems()[0]!.quantity).toBe(2);
  });

  it('handles corrupt localStorage data gracefully', () => {
    localStorage.setItem('guest_cart', 'not-valid-json');
    // Should not throw
    const freshService = TestBed.runInInjectionContext(() => new CartService());
    expect(freshService.getItems()).toEqual([]);
  });

  // ─── addItem ────────────────────────────────────────────────────────────

  it('adds a new item when product not in cart', () => {
    service.addItem(makeItem('p1'));
    expect(service.getItems()).toHaveLength(1);
    expect(service.itemCount()).toBe(1);
  });

  it('increments quantity when item already in cart', () => {
    service.addItem(makeItem('p1', 2));
    service.addItem(makeItem('p1', 3));
    expect(service.getItems()).toHaveLength(1);
    expect(service.getItems()[0]!.quantity).toBe(5);
    expect(service.itemCount()).toBe(5);
  });

  it('adds multiple different products', () => {
    service.addItem(makeItem('p1'));
    service.addItem(makeItem('p2'));
    expect(service.getItems()).toHaveLength(2);
    expect(service.itemCount()).toBe(2);
  });

  it('persists guest cart to localStorage after addItem', () => {
    service.addItem(makeItem('p1'));
    const stored = JSON.parse(localStorage.getItem('guest_cart') ?? '[]') as CartItemDTO[];
    expect(stored).toHaveLength(1);
    expect(stored[0]!.productId).toBe('p1');
  });

  // ─── removeItem ─────────────────────────────────────────────────────────

  it('removes item from cart', () => {
    service.addItem(makeItem('p1'));
    service.addItem(makeItem('p2'));
    service.removeItem('p1');
    expect(service.getItems()).toHaveLength(1);
    expect(service.getItems()[0]!.productId).toBe('p2');
  });

  it('does nothing when removing a non-existent product', () => {
    service.addItem(makeItem('p1'));
    service.removeItem('p-unknown');
    expect(service.getItems()).toHaveLength(1);
  });

  it('removes guest_cart localStorage key when cart becomes empty', () => {
    service.addItem(makeItem('p1'));
    service.removeItem('p1');
    expect(localStorage.getItem('guest_cart')).toBeNull();
  });

  // ─── updateQuantity ─────────────────────────────────────────────────────

  it('updates item quantity', () => {
    service.addItem(makeItem('p1', 1));
    service.updateQuantity('p1', 5);
    expect(service.getItems()[0]!.quantity).toBe(5);
  });

  it('removes item when update quantity is 0', () => {
    service.addItem(makeItem('p1'));
    service.updateQuantity('p1', 0);
    expect(service.getItems()).toHaveLength(0);
  });

  it('removes item when update quantity is negative', () => {
    service.addItem(makeItem('p1'));
    service.updateQuantity('p1', -1);
    expect(service.getItems()).toHaveLength(0);
  });

  // ─── clear ──────────────────────────────────────────────────────────────

  it('clears all cart items', () => {
    service.addItem(makeItem('p1'));
    service.addItem(makeItem('p2'));
    service.clear();
    expect(service.getItems()).toEqual([]);
    expect(service.itemCount()).toBe(0);
  });

  it('clears guest_cart from localStorage', () => {
    service.addItem(makeItem('p1'));
    service.clear();
    expect(localStorage.getItem('guest_cart')).toBeNull();
  });

  // ─── itemCount computed ──────────────────────────────────────────────────

  it('itemCount sums up all item quantities', () => {
    service.addItem(makeItem('p1', 3));
    service.addItem(makeItem('p2', 2));
    service.addItem(makeItem('p3', 5));
    expect(service.itemCount()).toBe(10);
  });

  // ─── waitForRestore ──────────────────────────────────────────────────────

  it('waitForRestore resolves for guest user', async () => {
    await expect(service.waitForRestore()).resolves.toBeUndefined();
  });

  // ─── Authenticated cart restore ──────────────────────────────────────────

  it('restores cart from backend for authenticated user', async () => {
    currentUserSignal.set({ id: 'user123', role: 'user' });
    const freshService = TestBed.runInInjectionContext(() => new CartService());
    const restorePromise = freshService.waitForRestore();

    const req = httpMock.expectOne('/api/users/user123/cart');
    req.flush({ userId: 'user123', items: [makeItem('p1', 2)], updatedAt: Date.now() });

    await restorePromise;
    expect(freshService.getItems()).toHaveLength(1);
    expect(freshService.getItems()[0]!.productId).toBe('p1');
  });

  it('handles HTTP error during authenticated cart restore gracefully', async () => {
    currentUserSignal.set({ id: 'user123', role: 'user' });
    const freshService = TestBed.runInInjectionContext(() => new CartService());
    const restorePromise = freshService.waitForRestore();

    const req = httpMock.expectOne('/api/users/user123/cart');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    await restorePromise;
    expect(freshService.getItems()).toEqual([]);
  });

  // ─── migrateToGuestOnLogout ──────────────────────────────────────────────

  it('migrates items to localStorage on logout', async () => {
    // Simulate authenticated user with items
    currentUserSignal.set({ id: 'u1', role: 'user' });
    const freshService = TestBed.runInInjectionContext(() => new CartService());

    const req = httpMock.expectOne('/api/users/u1/cart');
    req.flush({ userId: 'u1', items: [makeItem('p1', 3)], updatedAt: Date.now() });
    await freshService.waitForRestore();

    // Log out
    currentUserSignal.set(null);
    TestBed.flushEffects();

    // Items should have been written to localStorage
    const stored = localStorage.getItem('guest_cart');
    expect(stored).not.toBeNull();
    const items = JSON.parse(stored!) as CartItemDTO[];
    expect(items[0]!.productId).toBe('p1');
    expect(items[0]!.quantity).toBe(3);
  });

  // ─── mergeGuestCartOnLogin ───────────────────────────────────────────────

  it('loads authenticated cart when there is no guest cart on login', async () => {
    // No guest cart in localStorage — use the shared `service` so only one effect fires
    currentUserSignal.set({ id: 'u2', role: 'user' });
    TestBed.flushEffects();

    // mergeGuestCartOnLogin: no guest cart → restoreAuthenticatedCart → GET
    const getReq = httpMock.expectOne('/api/users/u2/cart');
    getReq.flush({ userId: 'u2', items: [makeItem('b1', 1)], updatedAt: Date.now() });

    await Promise.resolve(); // let firstValueFrom settle

    expect(service.getItems()[0]?.productId).toBe('b1');
  });

  it('merges guest cart with authenticated cart on login', async () => {
    // Guest cart has p1:2 — add directly to `service` to keep a single service instance
    service.addItem(makeItem('p1', 2));
    expect(service.getItems()[0]?.quantity).toBe(2);

    // Log in
    currentUserSignal.set({ id: 'u3', role: 'user' });
    TestBed.flushEffects();

    // GET auth cart returns p1:3, p2:1 (only service fires — one request)
    const getReq = httpMock.expectOne('/api/users/u3/cart');
    getReq.flush({
      userId: 'u3',
      items: [makeItem('p1', 3), makeItem('p2', 1)],
      updatedAt: Date.now(),
    });

    await Promise.resolve();
    await Promise.resolve(); // let nested await in mergeGuestCartOnLogin settle

    // PUT to sync merged cart
    const putReq = httpMock.expectOne('/api/users/u3/cart');
    putReq.flush({});

    await Promise.resolve();

    // Merged: p1 = 3+2 = 5, p2 = 1
    const items = service.getItems();
    const p1 = items.find((i) => i.productId === 'p1');
    const p2 = items.find((i) => i.productId === 'p2');
    expect(p1?.quantity).toBe(5);
    expect(p2?.quantity).toBe(1);
  });
});
