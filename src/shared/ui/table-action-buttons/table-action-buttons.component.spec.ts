import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TableActionButtonsComponent } from './table-action-buttons.component';

const findButtonByIcon = (
  fixture: ComponentFixture<TableActionButtonsComponent>,
  iconName: string
): HTMLButtonElement | undefined => {
  const buttons = fixture.nativeElement.querySelectorAll('button');
  return Array.from(buttons).find(
    (btn: any) => btn.querySelector('mat-icon')?.textContent?.trim() === iconName
  ) as HTMLButtonElement | undefined;
};

describe('TableActionButtonsComponent', () => {
  let component: TableActionButtonsComponent;
  let fixture: ComponentFixture<TableActionButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableActionButtonsComponent],
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
  });

  describe('Event emissions', () => {
    it('should emit edit event when edit button clicked', () => {
      let emitted = false;
      component.edit.subscribe(() => (emitted = true));
      fixture.detectChanges();

      const editButton = findButtonByIcon(fixture, 'edit') as HTMLButtonElement;

      editButton?.click();
      expect(emitted).toBe(true);
    });

    it('should emit delete event when delete button clicked', () => {
      let emitted = false;
      component.delete.subscribe(() => (emitted = true));
      fixture.detectChanges();

      const deleteButton = findButtonByIcon(fixture, 'delete') as HTMLButtonElement;

      deleteButton?.click();
      expect(emitted).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-labels from tooltips by default', () => {
      fixture.detectChanges();
      const editButton = findButtonByIcon(fixture, 'edit') as HTMLElement;

      expect(editButton?.getAttribute('aria-label')).toBe('Edit');
    });
  });
});
