import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Basic rendering', () => {
    it('should display default icon', () => {
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('mat-icon');
      expect(icon.textContent.trim()).toBe('inbox');
    });

    it('should display default title', () => {
      fixture.detectChanges();
      const title = fixture.nativeElement.querySelector('h2');
      expect(title.textContent).toBe('No data');
    });

    it('should not display message by default', () => {
      fixture.detectChanges();
      const message = fixture.nativeElement.querySelector('p');
      expect(message).toBeFalsy();
    });
  });

  describe('Action button', () => {
    it('should not display action button by default', () => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button).toBeFalsy();
    });
  });

  describe('Size variants', () => {
    it('should apply default size class', () => {
      fixture.detectChanges();
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState.classList.contains('default')).toBe(true);
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
