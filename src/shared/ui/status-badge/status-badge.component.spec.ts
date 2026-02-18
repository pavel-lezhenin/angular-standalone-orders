import { signal } from '@angular/core';
import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

const setSignalInput = (component: StatusBadgeComponent, inputName: string, value: unknown): void => {
  (component as unknown as Record<string, unknown>)[inputName] = signal(value);
};

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label', () => {
    setSignalInput(component, 'label', 'Test Label');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Label');
  });

  it('should apply variant class', () => {
    setSignalInput(component, 'label', 'Test');
    setSignalInput(component, 'variant', 'success');
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('mat-chip');
    expect(chip?.classList.contains('status-success')).toBe(true);
  });

  it('should apply size class', () => {
    setSignalInput(component, 'label', 'Test');
    setSignalInput(component, 'size', 'small');
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('mat-chip');
    expect(chip?.classList.contains('size-small')).toBe(true);
  });

  it('should render icon when provided', () => {
    setSignalInput(component, 'label', 'Test');
    setSignalInput(component, 'icon', 'check_circle');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('mat-icon');
    expect(icon).toBeTruthy();
    expect(icon?.textContent).toContain('check_circle');
  });

  it('should not render icon when not provided', () => {
    setSignalInput(component, 'label', 'Test');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('mat-icon');
    expect(icon).toBeFalsy();
  });

  it('should use neutral variant by default', () => {
    setSignalInput(component, 'label', 'Test');
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('mat-chip');
    expect(chip?.classList.contains('status-neutral')).toBe(true);
  });

  it('should use default size by default', () => {
    setSignalInput(component, 'label', 'Test');
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('mat-chip');
    expect(chip?.classList.contains('size-default')).toBe(true);
  });
});
