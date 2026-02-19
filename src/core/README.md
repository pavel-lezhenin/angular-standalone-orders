# Core

Singleton services, guards, and interceptors for application-wide functionality.

## Structure

- **guards/** - Route guards (authorization, authentication checks)
- **interceptors/** - HTTP interceptors (auth tokens, error handling)
- **services/** - Application-wide services (authentication, API, config)

## Rules

- Services should be provided with `providedIn: 'root'`
- Guards use `CanActivateFn` (functional guards)
- Interceptors use functional interceptor pattern
