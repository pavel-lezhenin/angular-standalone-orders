import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuantityControlComponent } from './quantity-control.component';

describe('QuantityControlComponent', () => {
  let component: QuantityControlComponent;
  let fixture: ComponentFixture<QuantityControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuantityControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuantityControlComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display quantity', () => {
    fixture.componentRef.setInput('quantity', 5);
    fixture.detectChanges();

    const quantitySpan = fixture.nativeElement.querySelector('.quantity');
    expect(quantitySpan?.textContent?.trim()).toBe('5');
  });

  it('should emit quantityChange on increment', () => {
    fixture.componentRef.setInput('quantity', 5);
    fixture.detectChanges();

    let emittedValue: number | undefined;
    const subscription = component.quantityChange.subscribe((value) => {
      emittedValue = value;
    });

    const incrementButton = fixture.nativeElement.querySelectorAll('button')[1];
    incrementButton.click();

    expect(emittedValue).toBe(6);
    subscription.unsubscribe();
  });

  it('should emit quantityChange on decrement', () => {
    fixture.componentRef.setInput('quantity', 5);
    fixture.detectChanges();

    let emittedValue: number | undefined;
    const subscription = component.quantityChange.subscribe((value) => {
      emittedValue = value;
    });

    const decrementButton = fixture.nativeElement.querySelectorAll('button')[0];
    decrementButton.click();

    expect(emittedValue).toBe(4);
    subscription.unsubscribe();
  });

  it('should disable decrement button when at minimum', () => {
    fixture.componentRef.setInput('quantity', 1);
    fixture.componentRef.setInput('min', 1);
    fixture.detectChanges();

    const decrementButton = fixture.nativeElement.querySelectorAll('button')[0];
    expect(decrementButton.disabled).toBe(true);
  });

  it('should disable increment button when at maximum', () => {
    fixture.componentRef.setInput('quantity', 10);
    fixture.componentRef.setInput('max', 10);
    fixture.detectChanges();

    const incrementButton = fixture.nativeElement.querySelectorAll('button')[1];
    expect(incrementButton.disabled).toBe(true);
  });

  it('should not disable increment button when max is null', () => {
    fixture.componentRef.setInput('quantity', 100);
    fixture.componentRef.setInput('max', null);
    fixture.detectChanges();

    const incrementButton = fixture.nativeElement.querySelectorAll('button')[1];
    expect(incrementButton.disabled).toBe(false);
  });

  it('should disable all buttons when disabled', () => {
    fixture.componentRef.setInput('quantity', 5);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);
  });

  it('should apply size class', () => {
    fixture.componentRef.setInput('quantity', 5);
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();

    const control = fixture.nativeElement.querySelector('.quantity-control');
    expect(control?.classList.contains('size-large')).toBe(true);
  });

  it('should not emit below minimum', () => {
    fixture.componentRef.setInput('quantity', 1);
    fixture.componentRef.setInput('min', 1);
    fixture.detectChanges();

    let emittedValue: number | undefined;
    const subscription = component.quantityChange.subscribe((value) => {
      emittedValue = value;
    });

    component['decrement']();

    expect(emittedValue).toBeUndefined();
    subscription.unsubscribe();
  });

  it('should not emit above maximum when max is set', () => {
    fixture.componentRef.setInput('quantity', 10);
    fixture.componentRef.setInput('max', 10);
    fixture.detectChanges();

    let emittedValue: number | undefined;
    const subscription = component.quantityChange.subscribe((value) => {
      emittedValue = value;
    });

    component['increment']();

    expect(emittedValue).toBeUndefined();
    subscription.unsubscribe();
  });
});
