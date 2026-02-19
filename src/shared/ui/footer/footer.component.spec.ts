import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let component: FooterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets currentYear to the current year', () => {
    expect(component.currentYear).toBe(new Date().getFullYear());
  });

  it('openTelegram opens correct URL in new tab', () => {
    const spy = vi.spyOn(window, 'open').mockImplementation(() => null);
    component.openTelegram();
    expect(spy).toHaveBeenCalledWith('https://t.me/orders_platform', '_blank');
  });

  it('openWhatsApp opens correct URL in new tab', () => {
    const spy = vi.spyOn(window, 'open').mockImplementation(() => null);
    component.openWhatsApp();
    expect(spy).toHaveBeenCalledWith('https://wa.me/1234567890', '_blank');
  });

  it('openLinkedIn opens correct URL in new tab', () => {
    const spy = vi.spyOn(window, 'open').mockImplementation(() => null);
    component.openLinkedIn();
    expect(spy).toHaveBeenCalledWith('https://linkedin.com/company/orders-platform', '_blank');
  });

  it('openGitHub opens correct URL in new tab', () => {
    const spy = vi.spyOn(window, 'open').mockImplementation(() => null);
    component.openGitHub();
    expect(spy).toHaveBeenCalledWith('https://github.com/orders-platform', '_blank');
  });

  it('sendEmail sets href to mailto link', () => {
    const location = { href: '' };
    vi.stubGlobal('location', location);
    component.sendEmail();
    expect(location.href).toBe('mailto:info@ordersplatform.com');
    vi.unstubAllGlobals();
  });
});
