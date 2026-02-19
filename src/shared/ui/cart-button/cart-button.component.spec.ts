import { signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartService } from '@/shared/services/cart.service';
import { CartButtonComponent } from './cart-button.component';

describe('CartButtonComponent', () => {
  let fixture: ComponentFixture<CartButtonComponent>;
  let component: CartButtonComponent;

  const itemCountSignal = signal(0);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartButtonComponent],
      providers: [
        provideRouter([]),
        {
          provide: CartService,
          useValue: {
            itemCount: itemCountSignal,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates to cart on button click', () => {
    const spy = vi.spyOn(component['router'], 'navigate').mockResolvedValue(true);
    component.navigateToCart();
    expect(spy).toHaveBeenCalledWith(['/shop/cart']);
  });

  it('reflects itemCount from CartService', () => {
    itemCountSignal.set(3);
    fixture.detectChanges();
    expect(component.cartService.itemCount()).toBe(3);
  });
});
