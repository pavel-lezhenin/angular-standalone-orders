import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

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
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Label');
  });

  it('should apply variant class', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('mat-chip');
    expect(chip?.classList.contains('status-success')).toBe(true);
  });

  it('should apply size class', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('mat-chip');
    expect(chip?.classList.contains('size-small')).toBe(true);
  });

  it('should render icon when provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('icon', 'check_circle');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('mat-icon');
    expect(icon).toBeTruthy();
    expect(icon?.textContent).toContain('check_circle');
  });

  it('should not render icon when not provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('mat-icon');
    expect(icon).toBeFalsy();
  });

  it('should use neutral variant by default', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('mat-chip');
    expect(chip?.classList.contains('status-neutral')).toBe(true);
  });

  it('should use default size by default', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('mat-chip');
    expect(chip?.classList.contains('size-default')).toBe(true);
  });
});
