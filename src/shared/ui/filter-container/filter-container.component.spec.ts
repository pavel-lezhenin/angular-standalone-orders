import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type { FilterAction } from './filter-container.component';
import { FilterContainerComponent } from './filter-container.component';

describe('FilterContainerComponent', () => {
  let fixture: ComponentFixture<FilterContainerComponent>;
  let component: FilterContainerComponent;

  const actions: FilterAction[] = [
    { id: 'reset', icon: 'refresh', ariaLabel: 'Reset filters' },
    { id: 'export', icon: 'download', ariaLabel: 'Export', disabled: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterContainerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('actions', actions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── onActionClick ────────────────────────────────────────────────────────

  it('onActionClick emits the action id', () => {
    const emitted: string[] = [];
    const sub = component.action.subscribe((id) => emitted.push(id));
    component.onActionClick('reset');
    expect(emitted).toEqual(['reset']);
    sub.unsubscribe();
  });

  // ─── isActionDisabled ────────────────────────────────────────────────────

  it('isActionDisabled returns false when not loading and action is enabled', () => {
    const action: FilterAction = { id: 'reset', icon: 'refresh', ariaLabel: 'Reset' };
    expect(component.isActionDisabled(action)).toBe(false);
  });

  it('isActionDisabled returns true when action.disabled is true', () => {
    const action: FilterAction = {
      id: 'export',
      icon: 'download',
      ariaLabel: 'Export',
      disabled: true,
    };
    expect(component.isActionDisabled(action)).toBe(true);
  });

  it('isActionDisabled returns true when isLoading is true', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    const action: FilterAction = { id: 'reset', icon: 'refresh', ariaLabel: 'Reset' };
    expect(component.isActionDisabled(action)).toBe(true);
  });

  it('isActionDisabled returns true when both isLoading and action.disabled are true', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    const action: FilterAction = {
      id: 'exp',
      icon: 'download',
      ariaLabel: 'Export',
      disabled: true,
    };
    expect(component.isActionDisabled(action)).toBe(true);
  });
});
