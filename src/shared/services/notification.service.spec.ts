import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBarMock: { dismiss: ReturnType<typeof vi.fn>; open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    snackBarMock = {
      dismiss: vi.fn(),
      open: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: snackBarMock }],
    });

    service = TestBed.inject(NotificationService);
  });

  describe('success()', () => {
    it('dismisses any existing snackbar before opening', () => {
      service.success('Saved!');
      expect(snackBarMock.dismiss).toHaveBeenCalledTimes(1);
    });

    it('opens a snackbar with success panel class', () => {
      service.success('Saved!');
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Saved!',
        'Close',
        expect.objectContaining({ panelClass: ['snackbar-success'] })
      );
    });

    it('uses default duration of 3000ms', () => {
      service.success('Done');
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Done',
        'Close',
        expect.objectContaining({ duration: 3000 })
      );
    });

    it('uses a custom duration when provided', () => {
      service.success('Saved!', 5000);
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Saved!',
        'Close',
        expect.objectContaining({ duration: 5000 })
      );
    });

    it('positions the snackbar at bottom-right', () => {
      service.success('Ok');
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Ok',
        'Close',
        expect.objectContaining({
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
        })
      );
    });
  });

  describe('error()', () => {
    it('dismisses any existing snackbar before opening', () => {
      service.error('Something went wrong');
      expect(snackBarMock.dismiss).toHaveBeenCalledTimes(1);
    });

    it('opens a snackbar with error panel class', () => {
      service.error('Failed!');
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Failed!',
        'Close',
        expect.objectContaining({ panelClass: ['snackbar-error'] })
      );
    });

    it('uses default duration of 3000ms', () => {
      service.error('Network error');
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Network error',
        'Close',
        expect.objectContaining({ duration: 3000 })
      );
    });

    it('uses a custom duration when provided', () => {
      service.error('Network error', 7000);
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Network error',
        'Close',
        expect.objectContaining({ duration: 7000 })
      );
    });

    it('positions the snackbar at bottom-right', () => {
      service.error('Oops');
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Oops',
        'Close',
        expect.objectContaining({
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
        })
      );
    });
  });
});
