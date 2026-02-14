import { Component, OnInit, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PageLoaderComponent } from '@shared/ui/page-loader/page-loader.component';
import { CartService } from '@shared/services/cart.service';
import { PaymentStateService } from '@shared/services/payment-state.service';
import { UserPreferencesService } from '@shared/services/user-preferences.service';
import { NotificationService } from '@shared/services/notification.service';
import { AuthService } from '@core/services/auth.service';
import { FormValidators } from '@shared/validators/form-validators';
import type { CartItemDTO, ProductDTO, CreateOrderDTO, OrderItemDTO, AddressDTO } from '@core/models';

interface CartItemWithProduct {
  cartItem: CartItemDTO;
  product: ProductDTO;
}

/**
 * Checkout Component
 *
 * Features:
 * - Works for both guests and authenticated users
 * - Guest checkout: collects email, personal info, and creates account atomically
 * - Email availability check for guests
 * - Order summary with cart items
 * - Delivery address form
 * - Order totals calculation
 * - Order creation with cart cleanup
 */
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
    PageLoaderComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export default class CheckoutComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cartService = inject(CartService);
  private paymentStateService = inject(PaymentStateService);
  private userPreferencesService = inject(UserPreferencesService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  protected checkoutForm!: FormGroup;
  protected cartItems = signal<CartItemWithProduct[]>([]);
  protected savedAddresses = signal<AddressDTO[]>([]);
  protected showAddressForm = signal(false);
  protected loading = signal(true);
  protected hasLoaded = signal(false);
  protected submitting = signal(false);
  protected error = signal<string | null>(null);
  protected emailChecking = signal(false);
  protected emailExists = signal(false);

  /**
   * Tax rate (10%)
   */
  private readonly TAX_RATE = 0.1;

  /**
   * Check if user is a guest
   */
  protected isGuest = computed(() => !this.authService.currentUser());
  protected hasSavedAddresses = computed(() => !this.isGuest() && this.savedAddresses().length > 0);
  protected shouldShowAddressForm = computed(() => {
    if (this.isGuest()) {
      return true;
    }

    return !this.hasSavedAddresses() || this.showAddressForm();
  });

  /**
   * Computed subtotal
   */
  protected subtotal = computed(() => {
    return this.cartItems().reduce((sum, item) => {
      return sum + item.product.price * item.cartItem.quantity;
    }, 0);
  });

  /**
   * Computed tax amount
   */
  protected tax = computed(() => this.subtotal() * this.TAX_RATE);

  /**
   * Computed total
   */
  protected total = computed(() => this.subtotal() + this.tax());

  /**
   * Check if cart is empty
   */
  protected isEmpty = computed(() => this.cartItems().length === 0);

  ngOnInit(): void {
    // Skip data loading on server (SSR)
    if (!this.isBrowser) {
      return;
    }

    this.initializeForm();
    this.initializeSavedAddresses();
    this.loadCartItems();
  }

  private async initializeSavedAddresses(): Promise<void> {
    if (this.isGuest()) {
      return;
    }

    const savedAddresses = await this.userPreferencesService.getSavedAddresses();

    this.savedAddresses.set(savedAddresses);

    const defaultAddress = savedAddresses.find((address: AddressDTO) => address.isDefault) ?? savedAddresses[0];
    if (defaultAddress) {
      this.applySavedAddress(defaultAddress);
      this.checkoutForm.patchValue({ selectedAddressId: defaultAddress.id });
      this.showAddressForm.set(false);
    } else {
      this.showAddressForm.set(true);
    }
  }

  /**
   * Initializes checkout form
   * Adds guest fields if user is not authenticated
   * Pre-fills form with user profile data for authenticated users
   */
  private initializeForm(): void {
    const currentUser = this.authService.currentUser();
    const isGuest = !currentUser;

    if (isGuest) {
      // Guest checkout form - includes account creation fields
      this.checkoutForm = this.fb.group({
        // Account creation fields
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        phone: ['', [Validators.required, FormValidators.phone]],
        
        // Delivery address fields
        addressLine1: ['', [Validators.required, Validators.minLength(5)]],
        addressLine2: [''],
        city: ['', [Validators.required, Validators.minLength(2)]],
        postalCode: ['', [Validators.required, FormValidators.postalCode]],
        
        // Address will be saved automatically for new users
      });

      // Watch email field for availability check
      this.checkoutForm.get('email')?.valueChanges.subscribe((email) => {
        if (email && this.checkoutForm.get('email')?.valid) {
          this.checkEmailAvailability(email);
        } else {
          this.emailExists.set(false);
        }
      });
    } else {
      // Authenticated user - pre-fill with profile data
      const profile = currentUser.profile;
      const fullName = `${profile.firstName} ${profile.lastName}`.trim();

      this.checkoutForm = this.fb.group({
        fullName: [fullName, [Validators.required, Validators.minLength(2)]],
        selectedAddressId: [''],
        addressLine1: ['', [Validators.required, Validators.minLength(5)]],
        addressLine2: [''],
        city: ['', [Validators.required, Validators.minLength(2)]],
        postalCode: ['', [Validators.required, FormValidators.postalCode]],
        phone: [profile.phone || '', [Validators.required, FormValidators.phone]],
        saveAddress: [true], // Save address to profile by default
      });
    }
  }

  /**
   * Checks if email is already registered
   */
  private async checkEmailAvailability(email: string): Promise<void> {
    this.emailChecking.set(true);

    try {
      const response = await firstValueFrom(
        this.http.get<{ exists: boolean }>(`/api/users/check-email`, {
          params: { email },
        })
      );

      this.emailExists.set(response.exists);

      if (response.exists) {
        this.checkoutForm.get('email')?.setErrors({ emailTaken: true });
      }
    } catch (error) {
      console.error('Failed to check email:', error);
    } finally {
      this.emailChecking.set(false);
    }
  }

  /**
   * Loads cart items and fetches product details
   */
  private async loadCartItems(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.cartService.waitForRestore();
      const items = this.cartService.getItems();

      if (items.length === 0) {
        this.notification.error('Your cart is empty');
        this.router.navigate(['/shop']);
        return;
      }

      // Fetch product details for each cart item
      const itemsWithProducts = await Promise.all(
        items.map(async (cartItem) => {
          try {
            const response = await firstValueFrom(
              this.http.get<{ product: ProductDTO }>(`/api/products/${cartItem.productId}`)
            );
            return {
              cartItem,
              product: response.product,
            };
          } catch (error) {
            console.error('Failed to load product:', cartItem.productId, error);
            throw new Error(`Failed to load product details for ${cartItem.productId}`);
          }
        })
      );

      this.cartItems.set(itemsWithProducts);
    } catch (err) {
      this.error.set('Failed to load cart items. Please try again.');
      console.error('Failed to load cart items:', err);
    } finally {
      this.hasLoaded.set(true);
      this.loading.set(false);
    }
  }

  /**
   * Places order
   * For guests: creates user account atomically with order
   * For authenticated users: prepares payment data
   */
  protected async placeOrder(): Promise<void> {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    // Check if email is taken for guests
    if (this.isGuest() && this.emailExists()) {
      this.notification.error('Email already registered. Please login instead.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    try {
      const formValue = this.checkoutForm.value;
      let userId: string;

      // Step 1: Get or create user
      if (this.isGuest()) {
        // Create new user account
        const newUser = await this.createGuestUser(formValue);
        userId = newUser.id;

        // Auto-login the new user
        await this.authService.login(formValue.email, formValue.password);
        
        this.notification.success('Account created successfully!');
      } else {
        // Use current authenticated user
        const user = this.authService.currentUser();
        if (!user) {
          throw new Error('Authentication required');
        }
        userId = user.id;

        // Save newly added address for authenticated users (if requested)
        if (this.shouldShowAddressForm() && formValue.saveAddress) {
          await this.updateUserAddress(userId, formValue);
        }
      }

      // Step 2: Prepare payment data and navigate to payment page
      await this.preparePayment(userId, formValue);

    } catch (err) {
      console.error('Failed to prepare order:', err);
      this.error.set(
        err instanceof Error ? err.message : 'Failed to prepare order. Please try again.'
      );
      this.notification.error('Failed to prepare order. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  /**
   * Creates new user account for guest checkout
   */
  private async createGuestUser(formValue: any): Promise<any> {
    // Build full address string from form fields
    const addressParts = [
      formValue.addressLine1,
      formValue.addressLine2,
      `${formValue.city}, ${formValue.postalCode}`,
    ].filter(Boolean);
    const fullAddress = addressParts.join(', ');

    const userData = {
      email: formValue.email,
      password: formValue.password,
      role: 'user',
      profile: {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phone: formValue.phone,
      },
    };

    const response = await firstValueFrom(
      this.http.post<any>('/api/users', userData)
    );

    console.log('User created, response:', response);

    if (!response || !response.id) {
      console.error('Invalid response from user creation:', response);
      throw new Error('Failed to create user account');
    }

    await this.http.post(`/api/users/${response.id}/addresses`, {
      label: 'Home',
      recipientName: `${formValue.firstName} ${formValue.lastName}`.trim(),
      addressLine1: formValue.addressLine1,
      addressLine2: formValue.addressLine2 || '',
      city: formValue.city,
      postalCode: formValue.postalCode,
      phone: formValue.phone,
      isDefault: true,
    }).toPromise();

    return response;
  }

  /**
   * Prepares payment data and navigates to payment page
   * Order will be created after successful payment
   */
  private async preparePayment(userId: string, formValue: any): Promise<void> {
    const isGuest = !this.authService.currentUser();
    const selectedAddress = !isGuest && !this.shouldShowAddressForm()
      ? this.savedAddresses().find(address => address.id === formValue.selectedAddressId)
      : null;

    // Build delivery address from form fields
    const deliveryAddress = isGuest
      ? [
          `${formValue.firstName} ${formValue.lastName}`,
          formValue.addressLine1,
          formValue.addressLine2,
          `${formValue.city}, ${formValue.postalCode}`,
          formValue.phone,
        ]
          .filter(Boolean)
          .join(', ')
      : [
          selectedAddress?.recipientName ?? formValue.fullName,
          selectedAddress?.addressLine1 ?? formValue.addressLine1,
          selectedAddress?.addressLine2 ?? formValue.addressLine2,
          `${selectedAddress?.city ?? formValue.city}, ${selectedAddress?.postalCode ?? formValue.postalCode}`,
          selectedAddress?.phone ?? formValue.phone,
        ]
          .filter(Boolean)
          .join(', ');

    // Build order items with current prices from products
    const orderItems: OrderItemDTO[] = this.cartItems().map((item) => ({
      productId: item.product.id,
      quantity: item.cartItem.quantity,
      price: item.product.price,
    }));

    // Create order DTO (will be used after payment)
    const createOrderData: CreateOrderDTO = {
      userId,
      items: orderItems,
      total: this.total(),
      deliveryAddress,
    };

    // Save pending payment data
    this.paymentStateService.setPendingPayment({
      orderData: createOrderData,
      total: this.total(),
      itemCount: this.cartItems().length,
    });

    // Navigate to payment page
    this.router.navigate(['/orders/payment']);
  }

  /**
   * Updates user's address in profile
   */
  private async updateUserAddress(userId: string, formValue: any): Promise<void> {
    try {
      await this.userPreferencesService.addAddress({
        label: 'Home',
        recipientName: formValue.fullName,
        addressLine1: formValue.addressLine1,
        addressLine2: formValue.addressLine2 || '',
        city: formValue.city,
        postalCode: formValue.postalCode,
        phone: formValue.phone,
        setAsDefault: this.savedAddresses().length === 0,
      });

      this.savedAddresses.set(await this.userPreferencesService.getSavedAddresses());
      this.showAddressForm.set(false);
    } catch (error) {
      console.error('Failed to update user address:', error);
      // Don't fail the order if address update fails
    }
  }

  protected onSavedAddressChange(addressId: string): void {
    const selectedAddress = this.savedAddresses().find(address => address.id === addressId);
    if (!selectedAddress) {
      return;
    }

    this.showAddressForm.set(false);
    this.applySavedAddress(selectedAddress);
  }

  protected toggleAddressForm(): void {
    const nextValue = !this.showAddressForm();
    this.showAddressForm.set(nextValue);

    if (nextValue) {
      this.checkoutForm.patchValue({
        selectedAddressId: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
      });

      return;
    }

    const selectedAddressId = this.checkoutForm.get('selectedAddressId')?.value as string | undefined;
    const selectedAddress = selectedAddressId
      ? this.savedAddresses().find(address => address.id === selectedAddressId)
      : this.savedAddresses().find(address => address.isDefault) ?? this.savedAddresses()[0];

    if (selectedAddress) {
      this.checkoutForm.patchValue({ selectedAddressId: selectedAddress.id });
      this.applySavedAddress(selectedAddress);
    }
  }

  private applySavedAddress(address: AddressDTO): void {
    this.checkoutForm.patchValue({
      fullName: address.recipientName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? '',
      city: address.city,
      postalCode: address.postalCode,
      phone: address.phone,
    });
  }

  /**
   * Navigate back to cart
   */
  protected backToCart(): void {
    this.router.navigate(['/orders/cart']);
  }
}

