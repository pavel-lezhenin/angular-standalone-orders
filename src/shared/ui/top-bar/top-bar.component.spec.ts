import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { NavItem } from '@/shared/models';
import { TopBarComponent } from './top-bar.component';

describe('TopBarComponent', () => {
  let fixture: ComponentFixture<TopBarComponent>;
  let component: TopBarComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TopBarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── isActive ───────────────────────────────────────────────────────────

  it('isActive returns false when item has no route', () => {
    const item: NavItem = { label: 'Action', action: vi.fn() };
    expect(component.isActive(item)).toBe(false);
  });

  it('isActive returns true for exact home route "/"', () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/');
    const item: NavItem = { label: 'Home', route: '/' };
    expect(component.isActive(item)).toBe(true);
  });

  it('isActive returns false for "/" when current url is "/shop"', () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/shop');
    const item: NavItem = { label: 'Home', route: '/' };
    expect(component.isActive(item)).toBe(false);
  });

  it('isActive returns true when current url starts with item.route', () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/shop/products?q=test');
    const item: NavItem = { label: 'Shop', route: '/shop' };
    expect(component.isActive(item)).toBe(true);
  });

  it('isActive returns false when current url does not start with item.route', () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/orders');
    const item: NavItem = { label: 'Shop', route: '/shop' };
    expect(component.isActive(item)).toBe(false);
  });

  // ─── handleNavClick ──────────────────────────────────────────────────────

  it('handleNavClick calls item.action when defined', () => {
    const action = vi.fn();
    const item: NavItem = { label: 'Action', action };
    component.handleNavClick(item);
    expect(action).toHaveBeenCalled();
  });

  it('handleNavClick navigates to route when no action defined', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const item: NavItem = { label: 'Shop', route: '/shop' };
    component.handleNavClick(item);
    expect(spy).toHaveBeenCalledWith(['/shop']);
  });

  it('handleNavClick does nothing when item has neither route nor action', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const item: NavItem = { label: 'Empty' };
    component.handleNavClick(item);
    expect(spy).not.toHaveBeenCalled();
  });

  // ─── handleSidenavToggle ─────────────────────────────────────────────────

  it('handleSidenavToggle calls onToggleSidenav when defined', () => {
    const toggle = vi.fn();
    component.onToggleSidenav = toggle;
    component.handleSidenavToggle();
    expect(toggle).toHaveBeenCalled();
  });

  it('handleSidenavToggle is a no-op when onToggleSidenav is not defined', () => {
    component.onToggleSidenav = undefined;
    expect(() => component.handleSidenavToggle()).not.toThrow();
  });
});
