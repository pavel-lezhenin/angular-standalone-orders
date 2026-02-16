import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TableActionButtonsComponent } from './table-action-buttons.component';

describe('TableActionButtonsComponent', () => {
  let component: TableActionButtonsComponent;
  let fixture: ComponentFixture<TableActionButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableActionButtonsComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TableActionButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Button visibility', () => {
    it('should show edit button by default', () => {
      const editButton = fixture.nativeElement.querySelector('button mat-icon:contains("edit")');
      expect(editButton).toBeTruthy();
    });

    it('should show delete button by default', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const deleteButton = Array.from(buttons).find((btn: any) => 
        btn.querySelector('mat-icon')?.textContent?.trim() === 'delete'
      );
      expect(deleteButton).toBeTruthy();
    });

    it('should not show view button by default', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const viewButton = Array.from(buttons).find((btn: any) => 
        btn.querySelector('mat-icon')?.textContent?.trim() === 'visibility'
      );
      expect(viewButton).toBeFalsy();
    });

    it('should hide edit button when canEdit is false', () => {
      fixture.componentRef.setInput('canEdit', false);
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const editButton = Array.from(buttons).find((btn: any) => 
        btn.querySelector('mat-icon')?.textContent?.trim() === 'edit'
      );
      expect(editButton).toBeFalsy();
    });

    it('should show view button when canView is true', () => {
      fixture.componentRef.setInput('canView', true);
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const viewButton = Array.from(buttons).find((btn: any) => 
        btn.querySelector('mat-icon')?.textContent?.trim() === 'visibility'
      );
      expect(viewButton).toBeTruthy();
    });
  });

  describe('Event emissions', () => {
    it('should emit edit event when edit button clicked', () => {
      let emitted = false;
      component.edit.subscribe(() => emitted = true);

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const editButton = Array.from(buttons).find((btn: any) => 
        btn.querySelector('mat-icon')?.textContent?.trim() === 'edit'
      ) as HTMLButtonElement;

      editButton?.click();
      expect(emitted).toBe(true);
    });

    it('should emit delete event when delete button clicked', () => {
      let emitted = false;
      component.delete.subscribe(() => emitted = true);

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const deleteButton = Array.from(buttons).find((btn: any) => 
        btn.querySelector('mat-icon')?.textContent?.trim() === 'delete'
      ) as HTMLButtonElement;

      deleteButton?.click();
      expect(emitted).toBe(true);
    });
  });

  describe('Customization', () => {
    it('should use custom icons', () => {
      fixture.componentRef.setInput('editIcon', 'create');
      fixture.componentRef.setInput('deleteIcon', 'remove');
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const editButton = Array.from(buttons).find((btn: any) => 
        btn.querySelector('mat-icon')?.textContent?.trim() === 'create'
      );
      const deleteButton = Array.from(buttons).find((btn: any) => 
        btn.querySelector('mat-icon')?.textContent?.trim() === 'remove'
      );

      expect(editButton).toBeTruthy();
      expect(deleteButton).toBeTruthy();
    });

    it('should use custom tooltips', () => {
      fixture.componentRef.setInput('editTooltip', 'Modify item');
      fixture.componentRef.setInput('deleteTooltip', 'Remove item');
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const editButton = Array.from(buttons).find((btn: any) => 
        btn.querySelector('mat-icon')?.textContent?.trim() === 'edit'
      ) as HTMLElement;
      const deleteButton = Array.from(buttons).find((btn: any) => 
        btn.querySelector('mat-icon')?.textContent?.trim() === 'delete'
      ) as HTMLElement;

      expect(editButton?.getAttribute('ng-reflect-message')).toBe('Modify item');
      expect(deleteButton?.getAttribute('ng-reflect-message')).toBe('Remove item');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-labels from tooltips by default', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const editButton = Array.from(buttons).find((btn: any) => 
        btn.querySelector('mat-icon')?.textContent?.trim() === 'edit'
      ) as HTMLElement;

      expect(editButton?.getAttribute('aria-label')).toBe('Edit');
    });

    it('should use custom aria-labels when provided', () => {
      fixture.componentRef.setInput('editAriaLabel', 'Edit this item');
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const editButton = Array.from(buttons).find((btn: any) => 
        btn.querySelector('mat-icon')?.textContent?.trim() === 'edit'
      ) as HTMLElement;

      expect(editButton?.getAttribute('aria-label')).toBe('Edit this item');
    });
  });
});
