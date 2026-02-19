import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import type { HttpHandler, HttpEvent } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { APIInterceptor } from './api.interceptor';
import { FakeBFFService } from '@bff';

describe('APIInterceptor', () => {
  let interceptor: APIInterceptor;
  let fakeBFFMock: Pick<FakeBFFService, 'handleRequest'>;

  beforeEach(() => {
    fakeBFFMock = {
      handleRequest: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [APIInterceptor, { provide: FakeBFFService, useValue: fakeBFFMock }],
    });

    interceptor = TestBed.inject(APIInterceptor);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('routes /api/* requests through FakeBFFService', async () => {
    const mockResponse = new HttpResponse({ body: { ok: true }, status: 200 });
    vi.mocked(fakeBFFMock.handleRequest).mockResolvedValue(mockResponse);

    const request = new HttpRequest('GET', '/api/products');
    const next: HttpHandler = { handle: vi.fn() } as unknown as HttpHandler;

    const event = await firstValueFrom(interceptor.intercept(request, next));

    expect(event).toBe(mockResponse);
    expect(fakeBFFMock.handleRequest).toHaveBeenCalledWith(request);
    expect(next.handle).not.toHaveBeenCalled();
  });

  it('passes non-/api/ requests to next handler', async () => {
    const mockEvent = new HttpResponse({ body: {}, status: 200 });
    const next: HttpHandler = {
      handle: vi.fn(() => of(mockEvent as HttpEvent<unknown>)),
    } as unknown as HttpHandler;

    const request = new HttpRequest('GET', '/assets/image.png');

    const event = await firstValueFrom(interceptor.intercept(request, next));

    expect(event).toBe(mockEvent);
    expect(next.handle).toHaveBeenCalledWith(request);
    expect(fakeBFFMock.handleRequest).not.toHaveBeenCalled();
  });

  it('passes requests that do not start with /api/ to next handler', async () => {
    const mockEvent = new HttpResponse({ body: null, status: 204 });
    const next: HttpHandler = {
      handle: vi.fn(() => of(mockEvent as HttpEvent<unknown>)),
    } as unknown as HttpHandler;

    const request = new HttpRequest('POST', 'https://external.api/data', {});

    const event = await firstValueFrom(interceptor.intercept(request, next));

    expect(event).toBe(mockEvent);
    expect(next.handle).toHaveBeenCalledWith(request);
  });
});
