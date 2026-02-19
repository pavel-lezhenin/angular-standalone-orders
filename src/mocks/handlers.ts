import { HttpResponse, http } from 'msw';

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
    };

    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        token: 'test-token-123',
        user: {
          id: '1',
          email: body.email,
          name: 'Test User',
        },
      });
    }

    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  // Orders endpoints
  http.get('/api/orders', () => {
    return HttpResponse.json([
      {
        id: '1',
        number: 'ORD-001',
        total: 99.99,
        status: 'delivered',
        createdAt: '2025-01-15T00:00:00Z',
      },
      {
        id: '2',
        number: 'ORD-002',
        total: 149.99,
        status: 'shipped',
        createdAt: '2025-02-01T00:00:00Z',
      },
      {
        id: '3',
        number: 'ORD-003',
        total: 299.99,
        status: 'processing',
        createdAt: '2025-02-05T00:00:00Z',
      },
    ]);
  }),

  http.get('/api/orders/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      number: `ORD-${String(id).padStart(3, '0')}`,
      total: 99.99,
      status: 'delivered',
      createdAt: '2025-01-15T00:00:00Z',
    });
  }),
];
