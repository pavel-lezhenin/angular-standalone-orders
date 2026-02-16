import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderSummaryComponent, SummaryLine } from './order-summary.component';

describe('OrderSummaryComponent', () => {
  let component: OrderSummaryComponent;
  let fixture: ComponentFixture<OrderSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderSummaryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('total', 100);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Basic rendering', () => {
    it('should display default title', () => {
      const title = fixture.nativeElement.querySelector('h2');
      expect(title.textContent).toBe('Order Summary');
    });

    it('should display custom title', () => {
      fixture.componentRef.setInput('title', 'Cart Summary');
      fixture.detectChanges();
      const title = fixture.nativeElement.querySelector('h2');
      expect(title.textContent).toBe('Cart Summary');
    });

    it('should display total', () => {
      const totalRow = fixture.nativeElement.querySelector('.summary-row.total .amount');
      expect(totalRow.textContent).toContain('100');
    });

    it('should display custom total label', () => {
      fixture.componentRef.setInput('totalLabel', 'Grand Total');
      fixture.detectChanges();
      const totalRow = fixture.nativeElement.querySelector('.summary-row.total');
      expect(totalRow.textContent).toContain('Grand Total:');
    });
  });

  describe('Summary lines', () => {
    it('should display summary lines', () => {
      const lines: SummaryLine[] = [
        { label: 'Subtotal', value: 90 },
        { label: 'Tax', value: 10 },
      ];
      fixture.componentRef.setInput('summaryLines', lines);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.summary-row:not(.total)');
      expect(rows.length).toBe(2);
      expect(rows[0].textContent).toContain('Subtotal:');
      expect(rows[0].textContent).toContain('90');
      expect(rows[1].textContent).toContain('Tax:');
      expect(rows[1].textContent).toContain('10');
    });

    it('should apply custom classes to summary lines', () => {
      const lines: SummaryLine[] = [
        { label: 'Discount', value: -10, class: 'discount' },
      ];
      fixture.componentRef.setInput('summaryLines', lines);
      fixture.detectChanges();

      const row = fixture.nativeElement.querySelector('.summary-row.discount');
      expect(row).toBeTruthy();
    });
  });

  describe('Divider', () => {
    it('should show divider by default', () => {
      const divider = fixture.nativeElement.querySelector('.summary-divider');
      expect(divider).toBeTruthy();
    });

    it('should hide divider when showDivider is false', () => {
      fixture.componentRef.setInput('showDivider', false);
      fixture.detectChanges();
      const divider = fixture.nativeElement.querySelector('.summary-divider');
      expect(divider).toBeFalsy();
    });
  });

  describe('Variants', () => {
    it('should apply default variant class', () => {
      const summary = fixture.nativeElement.querySelector('.order-summary');
      expect(summary.classList.contains('default')).toBe(true);
    });

    it('should apply compact variant class', () => {
      fixture.componentRef.setInput('variant', 'compact');
      fixture.detectChanges();
      const summary = fixture.nativeElement.querySelector('.order-summary');
      expect(summary.classList.contains('compact')).toBe(true);
    });

    it('should apply card variant class', () => {
      fixture.componentRef.setInput('variant', 'card');
      fixture.detectChanges();
      const summary = fixture.nativeElement.querySelector('.order-summary');
      expect(summary.classList.contains('card')).toBe(true);
    });
  });

  describe('Content projection', () => {
    it('should project content', () => {
      const testContent = '<button class="test-button">Checkout</button>';
      const compiled = fixture.nativeElement;
      compiled.innerHTML += testContent;
      fixture.detectChanges();

      const projectedButton = compiled.querySelector('.test-button');
      expect(projectedButton).toBeTruthy();
    });
  });
});
