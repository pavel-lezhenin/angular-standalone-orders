# Shared Services

Application-wide singleton services for cross-cutting concerns.

## LayoutService

Manages layout state (navigation menu, page title) for the MainLayout component.

### Usage

```typescript
import { LayoutService } from '@/shared/services/layout.service';

constructor(private layoutService: LayoutService) {}

ngOnInit() {
  this.layoutService.setTitle('My Page');
  this.layoutService.setNavItems([
    { label: 'Home', route: '/' },
    { label: 'About', route: '/about' }
  ]);
}
```
