# Shared

Reusable UI components, directives, pipes, and utility functions.

## Structure

- **ui/** - Reusable UI components (button, card, input, modal, table, etc.)
- **directives/** - Custom directives (click-outside, auto-focus, etc.)
- **pipes/** - Custom pipes (format-date, currency-format, etc.)
- **utils/** - Utility functions and helpers

## Rules

- No business logic
- No dependencies on other domains
- Can only import from external libs and other shared modules
- All exports should be standalone components/directives/pipes
