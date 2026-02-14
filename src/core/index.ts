// Core DTOs (exported with clean names for app layer convenience)
export type { UserDTO, UserProfileDTO } from './models';
export type { PermissionDTO } from './models';
export type { CartItemDTO, CartDTO } from './models';
export type { CategoryDTO } from './models';
export type { ProductDTO, ProductWithCategoryDTO, ProductSpecificationDTO } from './models';

// Shared types
export type { UserRole, OrderStatus } from './types/shared-types';

// Services
export { AuthService } from './services/auth.service';
export { PermissionService } from './services/permission.service';
export { FileStorageService } from './services/file-storage.service';

// Guards
export { authGuard, adminGuard, permissionGuard } from './guards';

// Interceptors
export { APIInterceptor } from './interceptors';

// Components
export { BaseComponent } from './components';
