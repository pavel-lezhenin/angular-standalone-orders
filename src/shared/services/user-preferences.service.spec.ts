import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { UserPreferencesService } from './user-preferences.service';
import { AuthService } from '@core/services/auth.service';
import type { AddressDTO, SavedPaymentMethodDTO } from '@core/models';

const USER_ID = 'user-42';
const authUser = { id: USER_ID, role: 'user' };

const tick = (): Promise<void> => new Promise<void>(r => setTimeout(r, 0));

const API = {
  addresses: `/api/users/${USER_ID}/addresses`,
  address: (id: string) => `/api/users/${USER_ID}/addresses/${id}`,
  paymentMethods: `/api/users/${USER_ID}/payment-methods`,
  paymentMethod: (id: string) => `/api/users/${USER_ID}/payment-methods/${id}`,
} as const;

const makeAddress = (overrides: Partial<AddressDTO> = {}): AddressDTO => ({
  id: 'addr-1',
  label: 'Home',
  recipientName: 'Jane Doe',
  addressLine1: '123 Main St',
  city: 'Anytown',
  postalCode: '12345',
  phone: '5551234567',
  isDefault: false,
  ...overrides,
});

const makeCard = (overrides: Partial<SavedPaymentMethodDTO> = {}): SavedPaymentMethodDTO => ({
  id: 'pm-1',
  type: 'card',
  last4Digits: '4242',
  cardholderName: 'John Doe',
  expiryMonth: '12',
  expiryYear: '2030',
  isDefault: false,
  createdAt: Date.now(),
  ...overrides,
});

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  let httpMock: HttpTestingController;
  let currentUserSignal: ReturnType<typeof signal<{ id: string; role: string } | null>>;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    currentUserSignal = signal<{ id: string; role: string } | null>(authUser);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: { currentUser: currentUserSignal },
        },
      ],
    });

    service = TestBed.inject(UserPreferencesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    try {
      httpMock.verify();
    } finally {
      TestBed.resetTestingModule();
    }
  });

  // ─── Address: getSavedAddresses ──────────────────────────────────────────

  describe('getSavedAddresses()', () => {
    it('returns empty array when user is not authenticated', async () => {
      currentUserSignal.set(null);
      const result = await service.getSavedAddresses();
      expect(result).toEqual([]);
    });

    it('fetches addresses for authenticated user', async () => {
      const addresses = [makeAddress({ isDefault: true })];
      const p = service.getSavedAddresses();
      httpMock.expectOne(API.addresses).flush({ addresses });
      expect(await p).toEqual(addresses);
    });

    it('returns empty array on HTTP error', async () => {
      const p = service.getSavedAddresses();
      httpMock.expectOne(API.addresses).flush('error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
      expect(await p).toEqual([]);
    });
  });

  // ─── Address: getDefaultAddress ──────────────────────────────────────────

  describe('getDefaultAddress()', () => {
    it('returns address with isDefault=true', async () => {
      const addr1 = makeAddress({ id: 'a1', isDefault: false });
      const addr2 = makeAddress({ id: 'a2', isDefault: true });
      const p = service.getDefaultAddress();
      httpMock.expectOne(API.addresses).flush({ addresses: [addr1, addr2] });
      expect((await p)?.id).toBe('a2');
    });

    it('falls back to first address when none is marked default', async () => {
      const addrs = [makeAddress({ id: 'a1' }), makeAddress({ id: 'a2' })];
      const p = service.getDefaultAddress();
      httpMock.expectOne(API.addresses).flush({ addresses: addrs });
      expect((await p)?.id).toBe('a1');
    });

    it('returns null when no addresses exist', async () => {
      const p = service.getDefaultAddress();
      httpMock.expectOne(API.addresses).flush({ addresses: [] });
      expect(await p).toBeNull();
    });
  });

  // ─── Address: addAddress ─────────────────────────────────────────────────

  describe('addAddress()', () => {
    it('throws when user is not authenticated', async () => {
      currentUserSignal.set(null);
      await expect(
        service.addAddress({
          label: 'Home',
          recipientName: 'Jane',
          addressLine1: '123 Main',
          city: 'TC',
          postalCode: '12345',
          phone: '5551234567',
        })
      ).rejects.toThrow('Authentication required');
    });

    it('posts to /api/users/:id/addresses and returns new address', async () => {
      const created = makeAddress({ id: 'new-id', isDefault: true });
      const p = service.addAddress({
        label: 'Work',
        recipientName: 'Jane',
        addressLine1: '1 Office Blvd',
        city: 'Worktown',
        postalCode: '12345',
        phone: '5559876543',
        setAsDefault: true,
      });
      httpMock.expectOne(API.addresses).flush({ address: created });
      expect(await p).toEqual(created);
    });
  });

  // ─── Address: updateAddress ──────────────────────────────────────────────

  describe('updateAddress()', () => {
    it('throws when user is not authenticated', async () => {
      currentUserSignal.set(null);
      await expect(service.updateAddress('addr-1', { city: 'New City' })).rejects.toThrow(
        'Authentication required'
      );
    });

    it('patches the correct address endpoint', async () => {
      const updated = makeAddress({ id: 'addr-1', city: 'Newtown' });
      const p = service.updateAddress('addr-1', { city: 'Newtown' });
      httpMock
        .expectOne(API.address('addr-1'))
        .flush({ address: updated });
      expect((await p).city).toBe('Newtown');
    });
  });

  // ─── Address: deleteAddress ──────────────────────────────────────────────

  describe('deleteAddress()', () => {
    it('throws when user is not authenticated', async () => {
      currentUserSignal.set(null);
      await expect(service.deleteAddress('addr-1')).rejects.toThrow('Authentication required');
    });

    it('throws when address not found', async () => {
      const p = service.deleteAddress('non-existent');
      httpMock
        .expectOne(API.addresses)
        .flush({ addresses: [makeAddress({ id: 'addr-1' })] });
      await expect(p).rejects.toThrow('Address not found');
    });

    it('throws when trying to delete the only default address', async () => {
      const p = service.deleteAddress('addr-1');
      httpMock
        .expectOne(API.addresses)
        .flush({ addresses: [makeAddress({ id: 'addr-1', isDefault: true })] });
      await expect(p).rejects.toThrow('Cannot delete the only default address');
    });

    it('sets fallback default when deleting the default address among multiple', async () => {
      const addr1 = makeAddress({ id: 'addr-1', isDefault: true });
      const addr2 = makeAddress({ id: 'addr-2', isDefault: false });
      const p = service.deleteAddress('addr-1');

      // getSavedAddresses
      httpMock.expectOne(API.addresses).flush({ addresses: [addr1, addr2] });
      await tick();

      // setDefaultAddress → updateAddress → PATCH
      httpMock.expectOne(API.address('addr-2')).flush({ address: { ...addr2, isDefault: true } });
      await tick();

      // DELETE
      httpMock.expectOne(API.address('addr-1')).flush({});

      await expect(p).resolves.toBeUndefined();
    });

    it('deletes a non-default address directly without setting a fallback', async () => {
      const addr1 = makeAddress({ id: 'addr-1', isDefault: true });
      const addr2 = makeAddress({ id: 'addr-2', isDefault: false });
      const p = service.deleteAddress('addr-2');

      httpMock.expectOne(API.addresses).flush({ addresses: [addr1, addr2] });
      await tick();

      httpMock.expectOne(API.address('addr-2')).flush({});

      await expect(p).resolves.toBeUndefined();
    });
  });

  // ─── Payment: getSavedPaymentMethods ─────────────────────────────────────

  describe('getSavedPaymentMethods()', () => {
    it('returns empty array when user is not authenticated', async () => {
      currentUserSignal.set(null);
      expect(await service.getSavedPaymentMethods()).toEqual([]);
    });

    it('fetches payment methods for authenticated user', async () => {
      const methods = [makeCard({ isDefault: true })];
      const p = service.getSavedPaymentMethods();
      httpMock.expectOne(API.paymentMethods).flush({ paymentMethods: methods });
      expect(await p).toEqual(methods);
    });

    it('returns empty array on HTTP error', async () => {
      const p = service.getSavedPaymentMethods();
      httpMock.expectOne(API.paymentMethods).flush('err', { status: 500, statusText: 'Error' });
      expect(await p).toEqual([]);
    });
  });

  // ─── Payment: getDefaultPaymentMethod ────────────────────────────────────

  describe('getDefaultPaymentMethod()', () => {
    it('returns method with isDefault=true', async () => {
      const m1 = makeCard({ id: 'm1' });
      const m2 = makeCard({ id: 'm2', isDefault: true });
      const p = service.getDefaultPaymentMethod();
      httpMock.expectOne(API.paymentMethods).flush({ paymentMethods: [m1, m2] });
      expect((await p)?.id).toBe('m2');
    });

    it('falls back to first when none is default', async () => {
      const methods = [makeCard({ id: 'm1' }), makeCard({ id: 'm2' })];
      const p = service.getDefaultPaymentMethod();
      httpMock.expectOne(API.paymentMethods).flush({ paymentMethods: methods });
      expect((await p)?.id).toBe('m1');
    });

    it('returns null when no methods exist', async () => {
      const p = service.getDefaultPaymentMethod();
      httpMock.expectOne(API.paymentMethods).flush({ paymentMethods: [] });
      expect(await p).toBeNull();
    });
  });

  // ─── Payment: addPaymentMethod ────────────────────────────────────────────

  describe('addPaymentMethod()', () => {
    it('throws when user is not authenticated', async () => {
      currentUserSignal.set(null);
      await expect(
        service.addPaymentMethod({ type: 'card', last4Digits: '4242' })
      ).rejects.toThrow('Authentication required');
    });

    it('returns existing duplicate card method without creating a new one', async () => {
      const existing = makeCard({ id: 'pm-1', isDefault: false });
      const p = service.addPaymentMethod({
        type: 'card',
        last4Digits: existing.last4Digits,
        cardholderName: existing.cardholderName,
        expiryMonth: existing.expiryMonth,
        expiryYear: existing.expiryYear,
      });
      httpMock.expectOne(API.paymentMethods).flush({ paymentMethods: [existing] });
      // Returns the duplicate — no POST needed
      expect((await p).id).toBe('pm-1');
    });

    it('detects duplicate paypal by email case-insensitively', async () => {
      const existing: SavedPaymentMethodDTO = {
        id: 'pp-1',
        type: 'paypal',
        paypalEmail: 'USER@EXAMPLE.COM',
        isDefault: false,
        createdAt: Date.now(),
      };
      const p = service.addPaymentMethod({
        type: 'paypal',
        paypalEmail: 'user@example.com',
      });
      httpMock.expectOne(API.paymentMethods).flush({ paymentMethods: [existing] });
      expect((await p).id).toBe('pp-1');
    });

    it('creates a new card method when no duplicate exists', async () => {
      const newMethod = makeCard({ id: 'pm-new' });
      const p = service.addPaymentMethod({
        type: 'card',
        last4Digits: '9999',
        cardholderName: 'Alice',
        expiryMonth: '01',
        expiryYear: '2035',
      });
      // Existing check returns empty
      httpMock.expectOne(API.paymentMethods).flush({ paymentMethods: [] });
      await tick();
      // POST
      httpMock.expectOne(API.paymentMethods).flush({ paymentMethod: newMethod });
      expect((await p).id).toBe('pm-new');
    });

    it('sets duplicate as default when setAsDefault=true and it is not already default', async () => {
      const existing = makeCard({ id: 'pm-1', isDefault: false });
      const refreshed = { ...existing, isDefault: true };
      const p = service.addPaymentMethod({
        type: 'card',
        last4Digits: existing.last4Digits,
        cardholderName: existing.cardholderName,
        expiryMonth: existing.expiryMonth,
        expiryYear: existing.expiryYear,
        setAsDefault: true,
      });

      // Existing methods check
      httpMock.expectOne(API.paymentMethods).flush({ paymentMethods: [existing] });
      await tick();

      // setDefaultPaymentMethod → PATCH
      httpMock.expectOne(API.paymentMethod(existing.id)).flush({});
      await tick();

      // Refresh getSavedPaymentMethods after setting default
      httpMock.expectOne(API.paymentMethods).flush({ paymentMethods: [refreshed] });

      expect((await p).isDefault).toBe(true);
    });
  });

  // ─── Payment: deletePaymentMethod ────────────────────────────────────────

  describe('deletePaymentMethod()', () => {
    it('throws when user is not authenticated', async () => {
      currentUserSignal.set(null);
      await expect(service.deletePaymentMethod('pm-1')).rejects.toThrow('Authentication required');
    });

    it('throws when payment method not found', async () => {
      const p = service.deletePaymentMethod('non-existent');
      httpMock.expectOne(API.paymentMethods).flush({ paymentMethods: [makeCard({ id: 'pm-1' })] });
      await expect(p).rejects.toThrow('Payment method not found');
    });

    it('throws when trying to delete the only default payment method', async () => {
      const p = service.deletePaymentMethod('pm-1');
      httpMock.expectOne(API.paymentMethods).flush({ paymentMethods: [makeCard({ id: 'pm-1', isDefault: true })] });
      await expect(p).rejects.toThrow('Cannot delete the only default payment method');
    });

    it('sets fallback default when deleting the default method among multiple', async () => {
      const m1 = makeCard({ id: 'pm-1', isDefault: true });
      const m2 = makeCard({ id: 'pm-2', isDefault: false });
      const p = service.deletePaymentMethod('pm-1');

      httpMock.expectOne(API.paymentMethods).flush({ paymentMethods: [m1, m2] });
      await tick();

      // setDefaultPaymentMethod → PATCH
      httpMock.expectOne(API.paymentMethod('pm-2')).flush({});
      await tick();

      // DELETE
      httpMock.expectOne(API.paymentMethod('pm-1')).flush({});

      await expect(p).resolves.toBeUndefined();
    });

    it('deletes a non-default method directly', async () => {
      const m1 = makeCard({ id: 'pm-1', isDefault: true });
      const m2 = makeCard({ id: 'pm-2', isDefault: false });
      const p = service.deletePaymentMethod('pm-2');

      httpMock.expectOne(API.paymentMethods).flush({ paymentMethods: [m1, m2] });
      await tick();

      httpMock.expectOne(API.paymentMethod('pm-2')).flush({});

      await expect(p).resolves.toBeUndefined();
    });
  });
});
