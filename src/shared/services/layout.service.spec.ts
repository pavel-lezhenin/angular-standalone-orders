import { TestBed } from '@angular/core/testing';
import { LayoutService } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutService);
  });

  it('initializes with default title "Orders Platform"', () => {
    expect(service.title()).toBe('Orders Platform');
  });

  it('initializes with empty navItems', () => {
    expect(service.navItems()).toEqual([]);
  });

  describe('setTitle()', () => {
    it('updates the title signal', () => {
      service.setTitle('Product Catalog');
      expect(service.title()).toBe('Product Catalog');
    });

    it('allows setting an empty string title', () => {
      service.setTitle('');
      expect(service.title()).toBe('');
    });
  });

  describe('setNavItems()', () => {
    it('updates the navItems signal', () => {
      const items = [
        { label: 'Home', route: '/' },
        { label: 'Shop', route: '/shop' },
      ];
      service.setNavItems(items);
      expect(service.navItems()).toEqual(items);
    });

    it('replaces existing nav items', () => {
      service.setNavItems([{ label: 'A', route: '/a' }]);
      service.setNavItems([{ label: 'B', route: '/b' }]);
      expect(service.navItems()).toHaveLength(1);
      expect(service.navItems()[0]!.label).toBe('B');
    });
  });

  describe('reset()', () => {
    it('resets the title to "Orders Platform"', () => {
      service.setTitle('Custom Title');
      service.reset();
      expect(service.title()).toBe('Orders Platform');
    });

    it('clears navItems', () => {
      service.setNavItems([{ label: 'Shop', route: '/shop' }]);
      service.reset();
      expect(service.navItems()).toEqual([]);
    });

    it('can be called multiple times without error', () => {
      service.reset();
      service.reset();
      expect(service.title()).toBe('Orders Platform');
    });
  });
});
