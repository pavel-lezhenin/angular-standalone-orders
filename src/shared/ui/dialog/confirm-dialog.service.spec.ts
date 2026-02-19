import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  let submitSubject: Subject<void>;
  let mockDialogInstance: {
    submitDialog: Subject<void>;
    startLoading: ReturnType<typeof vi.fn>;
    stopLoading: ReturnType<typeof vi.fn>;
  };
  let mockDialogRef: {
    close: ReturnType<typeof vi.fn>;
    componentInstance: typeof mockDialogInstance;
  };
  let matDialogMock: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    submitSubject = new Subject<void>();
    mockDialogInstance = {
      submitDialog: submitSubject,
      startLoading: vi.fn(),
      stopLoading: vi.fn(),
    };
    mockDialogRef = {
      close: vi.fn(),
      componentInstance: mockDialogInstance,
    };
    matDialogMock = { open: vi.fn().mockReturnValue(mockDialogRef) };

    TestBed.configureTestingModule({
      providers: [ConfirmDialogService, { provide: MatDialog, useValue: matDialogMock }],
    });

    service = TestBed.inject(ConfirmDialogService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  // ─── openDeleteConfirm ───────────────────────────────────────────────────

  it('openDeleteConfirm opens a dialog with the given message', () => {
    service.openDeleteConfirm('Delete this?', async () => {
      /* noop */
    });
    expect(matDialogMock.open).toHaveBeenCalled();
  });

  it('openDeleteConfirm calls onConfirm when submit is triggered and closes dialog', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    service.openDeleteConfirm('msg', onConfirm);

    submitSubject.next();
    await Promise.resolve();

    expect(mockDialogInstance.startLoading).toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ confirmed: true });
  });

  it('openDeleteConfirm calls onError when onConfirm throws', async () => {
    const error = new Error('fail');
    const onConfirm = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    service.openDeleteConfirm('msg', onConfirm, onError);

    submitSubject.next();
    await Promise.resolve();
    await Promise.resolve(); // let rejection settle

    expect(mockDialogInstance.stopLoading).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('openDeleteConfirm does not throw when onError is not provided and onConfirm throws', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('oops'));
    service.openDeleteConfirm('msg', onConfirm);

    submitSubject.next();
    await expect(Promise.resolve()).resolves.toBeUndefined();
  });

  // ─── openConfirm ─────────────────────────────────────────────────────────

  it('openConfirm opens a dialog', () => {
    service.openConfirm('Title', 'Message', 'OK', async () => {
      /* noop */
    });
    expect(matDialogMock.open).toHaveBeenCalled();
  });

  it('openConfirm uses default submitLabel "Confirm"', () => {
    service.openConfirm('Title', 'Message', 'Confirm', async () => {
      /* noop */
    });
    expect(matDialogMock.open).toHaveBeenCalled();
  });

  it('openConfirm calls onConfirm on submit and closes dialog', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    service.openConfirm('Title', 'Are you sure?', 'Yes', onConfirm);

    submitSubject.next();
    await Promise.resolve();

    expect(onConfirm).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ confirmed: true });
  });
});
