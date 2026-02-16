import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Basic rendering', () => {
    it('should display default icon', () => {
      const icon = fixture.nativeElement.querySelector('mat-icon');
      expect(icon.textContent.trim()).toBe('inbox');
    });

    it('should display custom icon', () => {
      fixture.componentRef.setInput('icon', 'shopping_cart');
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('mat-icon');
      expect(icon.textContent.trim()).toBe('shopping_cart');
    });

    it('should display default title', () => {
      const title = fixture.nativeElement.querySelector('h2');
      expect(title.textContent).toBe('No data');
    });

    it('should display custom title', () => {
      fixture.componentRef.setInput('title', 'Cart is empty');
      fixture.detectChanges();
      const title = fixture.nativeElement.querySelector('h2');
      expect(title.textContent).toBe('Cart is empty');
    });

    it('should not display message by default', () => {
      const message = fixture.nativeElement.querySelector('p');
      expect(message).toBeFalsy();
    });

    it('should display message when provided', () => {
      fixture.componentRef.setInput('message', 'Add items to continue');
      fixture.detectChanges();
      const message = fixture.nativeElement.querySelector('p');
      expect(message.textContent).toBe('Add items to continue');
    });
  });

  describe('Action button', () => {
    it('should not display action button by default', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button).toBeFalsy();
    });

    it('should display action button when actionLabel is provided', () => {
      fixture.componentRef.setInput('actionLabel', 'Go Shopping');
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button).toBeTruthy();
      expect(button.textContent.trim()).toContain('Go Shopping');
    });

    it('should display action icon when provided', () => {
      fixture.componentRef.setInput('actionLabel', 'Shop');
      fixture.componentRef.setInput('actionIcon', 'store');
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('button mat-icon');
      expect(icon.textContent.trim()).toBe('store');
    });

    it('should emit action event when button clicked', () => {
      let emitted = false;
      component.action.subscribe(() => emitted = true);

      fixture.componentRef.setInput('actionLabel', 'Click me');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      button.click();
      expect(emitted).toBe(true);
    });

    it('should apply custom color to button', () => {
      fixture.componentRef.setInput('actionLabel', 'Action');
      fixture.componentRef.setInput('actionColor', 'warn');
      fixture.detectChanges();
      
      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('ng-reflect-color')).toBe('warn');
    });
  });

  describe('Size variants', () => {
    it('should apply default size class', () => {
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState.classList.contains('default')).toBe(true);
    });

    it('should apply small size class', () => {
      fixture.componentRef.setInput('size', 'small');
      fixture.detectChanges();
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState.classList.contains('small')).toBe(true);
    });

    it('should apply large size class', () => {
      fixture.componentRef.setInput('size', 'large');
      fixture.detectChanges();
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState.classList.contains('large')).toBe(true);
    });
  });

  describe('Custom styling', () => {
    it('should apply custom state class', () => {
      fixture.componentRef.setInput('stateClass', 'custom-state');
      fixture.detectChanges();
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState.classList.contains('custom-state')).toBe(true);
    });
  });

  describe('Content projection', () => {
    it('should project custom content', () => {
      const testContent = '<div class="custom-content">Custom</div>';
      const compiled = fixture.nativeElement;
      compiled.innerHTML += testContent;
      fixture.detectChanges();

      const projected = compiled.querySelector('.custom-content');
      expect(projected).toBeTruthy();
    });
  });
});
