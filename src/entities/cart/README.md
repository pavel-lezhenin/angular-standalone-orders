# Cart Entity

Shopping cart functionality with hybrid persistence for guest and authenticated users.

## Features

- Guest cart storage in localStorage
- Authenticated cart storage in IndexedDB
- Automatic cart merge on login
- Cart migration on logout (preserves UX)
- Reactive state management with Angular signals

## Usage

```typescript
import { CartService } from '@/entities/cart/cart.service';

// Inject in component
constructor(private cartService: CartService) {}

// Add item
this.cartService.addItem({ productId: '123', quantity: 1, name: 'Product', price: 99.99 });

// Get item count
const count = this.cartService.itemCount();

// Get all items
const items = this.cartService.getItems();
```
