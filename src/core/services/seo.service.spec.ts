import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService, type PageMetaTags } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let metaMock: Pick<Meta, 'updateTag'>;
  let titleMock: Pick<Title, 'setTitle'>;

  beforeEach(() => {
    metaMock = {
      updateTag: vi.fn(),
    };
    titleMock = {
      setTitle: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        SeoService,
        { provide: Meta, useValue: metaMock },
        { provide: Title, useValue: titleMock },
      ],
    });

    service = TestBed.inject(SeoService);
  });

  afterEach(() => {
    // Clean up any injected script tags between tests
    document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => el.remove());
    vi.restoreAllMocks();
  });

  // ─── setPageMeta ──────────────────────────────────────────────────────────

  it('sets title and description (required fields only)', () => {
    const tags: PageMetaTags = {
      title: 'Products',
      description: 'Browse products',
    };

    service.setPageMeta(tags);

    expect(titleMock.setTitle).toHaveBeenCalledWith('Products');
    expect(metaMock.updateTag).toHaveBeenCalledWith({
      name: 'description',
      content: 'Browse products',
    });
  });

  it('sets keywords when provided', () => {
    const tags: PageMetaTags = {
      title: 'Products',
      description: 'Browse products',
      keywords: 'shoes, clothes',
    };

    service.setPageMeta(tags);

    expect(metaMock.updateTag).toHaveBeenCalledWith({
      name: 'keywords',
      content: 'shoes, clothes',
    });
  });

  it('does not set keywords when not provided', () => {
    service.setPageMeta({ title: 'T', description: 'D' });

    const calls = vi.mocked(metaMock.updateTag).mock.calls;
    const hasKeywords = calls.some(([arg]) => arg.name === 'keywords');
    expect(hasKeywords).toBe(false);
  });

  it('sets og:title when provided', () => {
    service.setPageMeta({ title: 'T', description: 'D', ogTitle: 'OG Title' });

    expect(metaMock.updateTag).toHaveBeenCalledWith({ property: 'og:title', content: 'OG Title' });
  });

  it('does not set og:title when not provided', () => {
    service.setPageMeta({ title: 'T', description: 'D' });

    const calls = vi.mocked(metaMock.updateTag).mock.calls;
    const hasOgTitle = calls.some(([arg]) => 'property' in arg && arg.property === 'og:title');
    expect(hasOgTitle).toBe(false);
  });

  it('sets og:description when provided', () => {
    service.setPageMeta({ title: 'T', description: 'D', ogDescription: 'OG Desc' });

    expect(metaMock.updateTag).toHaveBeenCalledWith({
      property: 'og:description',
      content: 'OG Desc',
    });
  });

  it('does not set og:description when not provided', () => {
    service.setPageMeta({ title: 'T', description: 'D' });

    const calls = vi.mocked(metaMock.updateTag).mock.calls;
    const has = calls.some(([arg]) => 'property' in arg && arg.property === 'og:description');
    expect(has).toBe(false);
  });

  it('sets og:url when provided', () => {
    service.setPageMeta({ title: 'T', description: 'D', ogUrl: 'https://example.com/page' });

    expect(metaMock.updateTag).toHaveBeenCalledWith({
      property: 'og:url',
      content: 'https://example.com/page',
    });
  });

  it('does not set og:url when not provided', () => {
    service.setPageMeta({ title: 'T', description: 'D' });

    const calls = vi.mocked(metaMock.updateTag).mock.calls;
    const has = calls.some(([arg]) => 'property' in arg && arg.property === 'og:url');
    expect(has).toBe(false);
  });

  it('sets canonical link when provided', () => {
    service.setPageMeta({
      title: 'T',
      description: 'D',
      canonical: 'https://example.com/canonical',
    });

    expect(metaMock.updateTag).toHaveBeenCalledWith({
      rel: 'canonical',
      href: 'https://example.com/canonical',
    });
  });

  it('does not set canonical when not provided', () => {
    service.setPageMeta({ title: 'T', description: 'D' });

    const calls = vi.mocked(metaMock.updateTag).mock.calls;
    const has = calls.some(([arg]) => 'rel' in arg);
    expect(has).toBe(false);
  });

  it('sets all optional fields when all are provided', () => {
    const tags: PageMetaTags = {
      title: 'Full',
      description: 'Full desc',
      keywords: 'kw',
      ogTitle: 'OG',
      ogDescription: 'OG desc',
      ogUrl: 'https://example.com',
      canonical: 'https://example.com/canonical',
    };

    service.setPageMeta(tags);

    expect(metaMock.updateTag).toHaveBeenCalledTimes(6);
  });

  // ─── resetPageMeta ────────────────────────────────────────────────────────

  it('resetPageMeta restores default title and description', () => {
    service.resetPageMeta();

    expect(titleMock.setTitle).toHaveBeenCalledWith('Angular Standalone Orders');
    expect(metaMock.updateTag).toHaveBeenCalledWith({
      name: 'description',
      content:
        'Discover our curated collection of products. Browse, compare, and order with ease using our modern shopping platform.',
    });
  });

  // ─── setBreadcrumbSchema ──────────────────────────────────────────────────

  it('setBreadcrumbSchema injects a ld+json script tag into document.head', () => {
    const breadcrumbs = [
      { name: 'Home', url: 'https://example.com' },
      { name: 'Products', url: 'https://example.com/products' },
    ];

    service.setBreadcrumbSchema(breadcrumbs);

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBeGreaterThanOrEqual(1);

    const lastScript = scripts[scripts.length - 1]!;
    const parsed = JSON.parse(lastScript.textContent ?? '');
    expect(parsed['@type']).toBe('BreadcrumbList');
    expect(parsed.itemListElement).toHaveLength(2);
    expect(parsed.itemListElement[0]).toMatchObject({ position: 1, name: 'Home' });
    expect(parsed.itemListElement[1]).toMatchObject({ position: 2, name: 'Products' });
  });

  it('setBreadcrumbSchema handles empty breadcrumbs array', () => {
    service.setBreadcrumbSchema([]);

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const lastScript = scripts[scripts.length - 1]!;
    const parsed = JSON.parse(lastScript.textContent ?? '');
    expect(parsed.itemListElement).toHaveLength(0);
  });

  // ─── setProductSchema ─────────────────────────────────────────────────────

  it('setProductSchema injects a ld+json Product schema', () => {
    service.setProductSchema({
      name: 'Sneakers',
      description: 'Cool shoes',
      price: 99.99,
      currency: 'USD',
      url: 'https://example.com/sneakers',
    });

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const lastScript = scripts[scripts.length - 1]!;
    const parsed = JSON.parse(lastScript.textContent ?? '');

    expect(parsed['@type']).toBe('Product');
    expect(parsed.name).toBe('Sneakers');
    expect(parsed.offers.price).toBe(99.99);
    expect(parsed.offers.priceCurrency).toBe('USD');
    expect(parsed.aggregateRating).toBeUndefined();
  });

  it('setProductSchema includes aggregateRating when rating is provided', () => {
    service.setProductSchema({
      name: 'Sneakers',
      description: 'Cool shoes',
      price: 99.99,
      currency: 'USD',
      url: 'https://example.com/sneakers',
      rating: 4.5,
    });

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const lastScript = scripts[scripts.length - 1]!;
    const parsed = JSON.parse(lastScript.textContent ?? '');

    expect(parsed.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 4.5,
      ratingCount: 1,
    });
  });
});
