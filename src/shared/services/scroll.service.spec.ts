import { TestBed } from '@angular/core/testing';
import { ScrollService } from './scroll.service';

describe('ScrollService', () => {
  let service: ScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollService);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clean up any injected test elements
    document.querySelectorAll('[data-test-scroll]').forEach((el) => el.remove());
  });

  describe('scrollToSection()', () => {
    it('does nothing when element with given id does not exist', () => {
      service.scrollToSection('nonexistent-section');
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it('calls window.scrollTo with smooth behavior when element found', () => {
      const el = document.createElement('div');
      el.id = 'hero-section';
      el.setAttribute('data-test-scroll', '1');
      document.body.appendChild(el);

      service.scrollToSection('hero-section');

      expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    });

    it('compensates for top-bar height when .top-bar element exists', () => {
      const topBar = document.createElement('div');
      topBar.className = 'top-bar';
      topBar.setAttribute('data-test-scroll', '1');
      document.body.appendChild(topBar);
      vi.spyOn(topBar, 'getBoundingClientRect').mockReturnValue({
        height: 80,
        top: 0,
        bottom: 80,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect);

      const section = document.createElement('div');
      section.id = 'about-section';
      section.setAttribute('data-test-scroll', '1');
      document.body.appendChild(section);
      vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
        top: 300,
        height: 200,
        bottom: 500,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect);

      Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });

      service.scrollToSection('about-section');

      // offsetPosition = 300 + 100 - 80 - 20 = 300
      expect(window.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ top: 300, behavior: 'smooth' })
      );
    });

    it('uses fallback top-bar height of 64 when .top-bar element is absent', () => {
      const section = document.createElement('div');
      section.id = 'features-section';
      section.setAttribute('data-test-scroll', '1');
      document.body.appendChild(section);
      vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
        top: 200,
        height: 100,
        bottom: 300,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect);

      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });

      service.scrollToSection('features-section');

      // offsetPosition = 200 + 0 - 64 - 20 = 116
      expect(window.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ top: 116, behavior: 'smooth' })
      );
    });
  });
});
