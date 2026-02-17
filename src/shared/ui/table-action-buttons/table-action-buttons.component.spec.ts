import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TableActionButtonsComponent } from './table-action-buttons.component';

const setSignalInput = (component: TableActionButtonsComponent, inputName: string, value: unknown): void => {
  (component as unknown as Record<string, unknown>)[inputName] = signal(value);
};

const findButtonByIcon = (fixture: ComponentFixture<TableActionButtonsComponent>, iconName: string): HTMLButtonElement | undefined => {
  const buttons = fixture.nativeElement.querySelectorAll('button');
  return Array.from(buttons).find((btn: any) => btn.querySelector('mat-icon')?.textContent?.trim() === iconName) as HTMLButtonElement | undefined;
};

describe('TableActionButtonsComponent', () => {
  let component: TableActionButtonsComponent;
  let fixture: ComponentFixture<TableActionButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableActionButtonsComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TableActionButtonsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Button visibility', () => {
    it('should show edit button by default', () => {
      fixture.detectChanges();
      const editButton = findButtonByIcon(fixture, 'edit');
      expect(editButton).toBeTruthy();
    });

    it('should show delete button by default', () => {
      fixture.detectChanges();
      const deleteButton = findButtonByIcon(fixture, 'delete');
      expect(deleteButton).toBeTruthy();
    });

    it('should not show view button by default', () => {
      fixture.detectChanges();
      const viewButton = findButtonByIcon(fixture, 'visibility');
      expect(viewButton).toBeFalsy();
    });

    it('should hide edit button when canEdit is false', () => {
      setSignalInput(component, 'canEdit', false);
      fixture.detectChanges();
      const editButton = findButtonByIcon(fixture, 'edit');
      expect(editButton).toBeFalsy();
    });

    it('should show view button when canView is true', () => {
      setSignalInput(component, 'canView', true);
      fixture.detectChanges();
      const viewButton = findButtonByIcon(fixture, 'visibility');
      expect(viewButton).toBeTruthy();
    });
  });

  describe('Event emissions', () => {
    it('should emit edit event when edit button clicked', () => {
      let emitted = false;
      component.edit.subscribe(() => emitted = true);
      fixture.detectChanges();

      const editButton = findButtonByIcon(fixture, 'edit') as HTMLButtonElement;

      editButton?.click();
      expect(emitted).toBe(true);
    });

    it('should emit delete event when delete button clicked', () => {
      let emitted = false;
      component.delete.subscribe(() => emitted = true);
      fixture.detectChanges();

      const deleteButton = findButtonByIcon(fixture, 'delete') as HTMLButtonElement;

      deleteButton?.click();
      expect(emitted).toBe(true);
    });
  });

  describe('Customization', () => {
    it('should use custom icons', () => {
      setSignalInput(component, 'editIcon', 'create');
      setSignalInput(component, 'deleteIcon', 'remove');
      fixture.detectChanges();

      const editButton = findButtonByIcon(fixture, 'create');
      const deleteButton = findButtonByIcon(fixture, 'remove');

      expect(editButton).toBeTruthy();
      expect(deleteButton).toBeTruthy();
    });

    it('should use custom tooltips', () => {
      setSignalInput(component, 'editTooltip', 'Modify item');
      setSignalInput(component, 'deleteTooltip', 'Remove item');
      fixture.detectChanges();

      const editButton = findButtonByIcon(fixture, 'edit') as HTMLElement;
      const deleteButton = findButtonByIcon(fixture, 'delete') as HTMLElement;

      expect(editButton?.getAttribute('aria-label')).toBe('Modify item');
      expect(deleteButton?.getAttribute('aria-label')).toBe('Remove item');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-labels from tooltips by default', () => {
      fixture.detectChanges();
      const editButton = findButtonByIcon(fixture, 'edit') as HTMLElement;

      expect(editButton?.getAttribute('aria-label')).toBe('Edit');
    });

    it('should use custom aria-labels when provided', () => {
      setSignalInput(component, 'editAriaLabel', 'Edit this item');
      fixture.detectChanges();

      const editButton = findButtonByIcon(fixture, 'edit') as HTMLElement;

      expect(editButton?.getAttribute('aria-label')).toBe('Edit this item');
    });
  });
});
