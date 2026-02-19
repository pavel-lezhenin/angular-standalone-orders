import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { DialogComponent } from './dialog.component';

const makeDialogRef = (): {
  close: ReturnType<typeof vi.fn>;
  disableClose: boolean;
  backdropClick: () => ReturnType<Subject<MouseEvent>['asObservable']>;
  keydownEvents: () => ReturnType<Subject<KeyboardEvent>['asObservable']>;
  _backdropClick$: Subject<MouseEvent>;
  _keydown$: Subject<KeyboardEvent>;
} => {
  const backdropClick$ = new Subject<MouseEvent>();
  const keydown$ = new Subject<KeyboardEvent>();
  return {
    close: vi.fn(),
    disableClose: false,
    backdropClick: () => backdropClick$.asObservable(),
    keydownEvents: () => keydown$.asObservable(),
    _backdropClick$: backdropClick$,
    _keydown$: keydown$,
  };
};

describe('DialogComponent', () => {
  let fixture: ComponentFixture<DialogComponent>;
  let component: DialogComponent;
  let dialogRef: ReturnType<typeof makeDialogRef>;

  const createComponent = async (data: Record<string, unknown>): Promise<void> => {
    dialogRef = makeDialogRef();

    await TestBed.configureTestingModule({
      imports: [DialogComponent, MatDialogModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create (form type)', async () => {
    await createComponent({ title: 'Test' });
    expect(component).toBeTruthy();
  });

  // ─── computed type/labels ────────────────────────────────────────────────

  it('defaults to form type when not specified', async () => {
    await createComponent({ title: 'Form' });
    expect(component['type']()).toBe('form');
  });

  it('reflects notification type from data', async () => {
    await createComponent({ title: 'Info', type: 'notification' });
    expect(component['type']()).toBe('notification');
    expect(component['isNotification']()).toBe(true);
  });

  it('reflects confirm type from data', async () => {
    await createComponent({ title: 'Confirm', type: 'confirm' });
    expect(component['isForm']()).toBe(true);
  });

  it('uses default submitLabel "Update" when not provided', async () => {
    await createComponent({ title: 'T' });
    expect(component['submitLabel']()).toBe('Update');
  });

  it('uses provided submitLabel', async () => {
    await createComponent({ title: 'T', submitLabel: 'Save' });
    expect(component['submitLabel']()).toBe('Save');
  });

  it('uses default cancelLabel "Cancel" when not provided', async () => {
    await createComponent({ title: 'T' });
    expect(component['cancelLabel']()).toBe('Cancel');
  });

  // ─── setLoading / startLoading / stopLoading ─────────────────────────────

  it('setLoading(true) sets isLoading to true', async () => {
    await createComponent({ title: 'T' });
    component.setLoading(true);
    expect(component.isLoading()).toBe(true);
  });

  it('setLoading(false) sets isLoading to false', async () => {
    await createComponent({ title: 'T' });
    component.setLoading(true);
    component.setLoading(false);
    expect(component.isLoading()).toBe(false);
  });

  // ─── handleSubmit ────────────────────────────────────────────────────────

  it('handleSubmit emits submitDialog when not loading', async () => {
    await createComponent({ title: 'T' });
    const spy = vi.spyOn(component.submitDialog, 'emit');
    component['handleSubmit']();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('handleSubmit does not emit when loading', async () => {
    await createComponent({ title: 'T' });
    component.setLoading(true);
    const spy = vi.spyOn(component.submitDialog, 'emit');
    component['handleSubmit']();
    expect(spy).not.toHaveBeenCalled();
  });

  // ─── handleCancel ────────────────────────────────────────────────────────

  it('handleCancel emits cancelDialog and closes the dialog', async () => {
    await createComponent({ title: 'T' });
    const spy = vi.spyOn(component.cancelDialog, 'emit');
    component['handleCancel']();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(dialogRef.close).toHaveBeenCalledWith({ cancelled: true });
  });

  it('handleCancel does nothing when loading', async () => {
    await createComponent({ title: 'T' });
    component.setLoading(true);
    component['handleCancel']();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  // ─── handleClose ─────────────────────────────────────────────────────────

  it('handleClose closes the dialog when not loading', async () => {
    await createComponent({ title: 'T', type: 'notification' });
    component['handleClose']();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('handleClose does nothing when loading', async () => {
    await createComponent({ title: 'T', type: 'notification' });
    component.setLoading(true);
    component['handleClose']();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  // ─── canClose computed ────────────────────────────────────────────────────

  it('canClose is true when not loading', async () => {
    await createComponent({ title: 'T' });
    expect(component['canClose']()).toBe(true);
  });

  it('canClose is false when loading', async () => {
    await createComponent({ title: 'T' });
    component.setLoading(true);
    expect(component['canClose']()).toBe(false);
  });

  // ─── backdrop / keydown ───────────────────────────────────────────────────

  it('backdrop click closes when not loading', async () => {
    await createComponent({ title: 'T', disableBackdropClick: true });
    const spy = vi.spyOn(component.cancelDialog, 'emit');
    dialogRef._backdropClick$.next(new MouseEvent('click'));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('Escape key closes when not loading', async () => {
    await createComponent({ title: 'T' });
    const spy = vi.spyOn(component.cancelDialog, 'emit');
    dialogRef._keydown$.next(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('non-Escape key does not close', async () => {
    await createComponent({ title: 'T' });
    const emitted: void[] = [];
    const sub = component.cancelDialog.subscribe(() => emitted.push());
    dialogRef._keydown$.next(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(emitted).toHaveLength(0);
    sub.unsubscribe();
  });
});
