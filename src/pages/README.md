# Pages

Route-level orchestration components. Each page is a route component that composes widgets and features.

**CRITICAL RULE**: Pages do NOT contain business logic - they orchestrate, compose, and delegate.

## Structure

Each page folder should contain:
- `page-name.component.ts` - The main component
- `page-name.component.html` - Template
- `page-name.component.scss` - Styles

## Examples

- `landing/` - Public landing page
- `auth/` - Login, register, password reset
- `dashboard/` - Admin dashboard
- `orders/` - User orders listing
- `profile/` - User profile management
