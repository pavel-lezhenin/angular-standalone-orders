import { HttpResponse } from '@angular/common/http';

/**
 * HTTP Response Helpers
 * Convenient wrappers for creating standardized HTTP responses
 */

/**
 * 200 OK Response
 */
export class OkResponse<T = unknown> extends HttpResponse<T> {
  constructor(body: T) {
    super({ status: 200, body });
  }
}

/**
 * 201 Created Response
 */
export class CreatedResponse<T = unknown> extends HttpResponse<T> {
  constructor(body: T) {
    super({ status: 201, body });
  }
}

/**
 * 204 No Content Response
 */
export class NoContentResponse extends HttpResponse<null> {
  constructor() {
    super({ status: 204, body: null });
  }
}

/**
 * 400 Bad Request Response
 */
export class BadRequestResponse extends HttpResponse<{ error: string }> {
  constructor(error: string) {
    super({ status: 400, body: { error } });
  }
}

/**
 * 401 Unauthorized Response
 */
export class UnauthorizedResponse extends HttpResponse<{ error: string }> {
  constructor(error = 'Invalid credentials') {
    super({ status: 401, body: { error } });
  }
}

/**
 * 404 Not Found Response
 */
export class NotFoundResponse extends HttpResponse<{ error: string }> {
  constructor(error = 'Not found') {
    super({ status: 404, body: { error } });
  }
}

/**
 * 409 Conflict Response
 */
export class ConflictResponse extends HttpResponse<{ error: string }> {
  constructor(error = 'Conflict') {
    super({ status: 409, body: { error } });
  }
}

/**
 * 500 Internal Server Error Response
 */
export class ServerErrorResponse extends HttpResponse<{ error: string }> {
  constructor(error = 'Internal server error') {
    super({ status: 500, body: { error } });
  }
}
