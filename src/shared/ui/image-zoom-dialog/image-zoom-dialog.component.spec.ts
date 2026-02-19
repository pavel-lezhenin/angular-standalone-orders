import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import type { ImageZoomDialogData } from './image-zoom-dialog.component';
import { ImageZoomDialogComponent } from './image-zoom-dialog.component';

const makeData = (overrides?: Partial<ImageZoomDialogData>): ImageZoomDialogData => ({
  images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
  currentIndex: 0,
  productName: 'Test Product',
  ...overrides,
});

describe('ImageZoomDialogComponent', () => {
  let fixture: ComponentFixture<ImageZoomDialogComponent>;
  let component: ImageZoomDialogComponent;
  const dialogRefMock = { close: vi.fn() };

  const createComponent = async (data: ImageZoomDialogData): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ImageZoomDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageZoomDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('should create', async () => {
    await createComponent(makeData());
    expect(component).toBeTruthy();
  });

  it('currentImage returns the image at currentIndex', async () => {
    await createComponent(makeData({ currentIndex: 1 }));
    expect(component['currentImage']).toBe('img2.jpg');
  });

  it('currentImage returns empty string for out-of-bounds index', async () => {
    await createComponent(makeData({ images: [], currentIndex: 0 }));
    expect(component['currentImage']).toBe('');
  });

  // ─── canGoPrevious / canGoNext ────────────────────────────────────────────

  it('canGoPrevious is false at index 0', async () => {
    await createComponent(makeData({ currentIndex: 0 }));
    expect(component['canGoPrevious']).toBe(false);
  });

  it('canGoPrevious is true when index > 0', async () => {
    await createComponent(makeData({ currentIndex: 2 }));
    expect(component['canGoPrevious']).toBe(true);
  });

  it('canGoNext is true when not at last image', async () => {
    await createComponent(makeData({ currentIndex: 1 }));
    expect(component['canGoNext']).toBe(true);
  });

  it('canGoNext is false at last image', async () => {
    await createComponent(makeData({ currentIndex: 2 }));
    expect(component['canGoNext']).toBe(false);
  });

  // ─── navigation ──────────────────────────────────────────────────────────

  it('previous decrements currentIndex', async () => {
    await createComponent(makeData({ currentIndex: 2 }));
    component['previous']();
    expect(component['currentIndex']).toBe(1);
  });

  it('previous does not go below 0', async () => {
    await createComponent(makeData({ currentIndex: 0 }));
    component['previous']();
    expect(component['currentIndex']).toBe(0);
  });

  it('next increments currentIndex', async () => {
    await createComponent(makeData({ currentIndex: 0 }));
    component['next']();
    expect(component['currentIndex']).toBe(1);
  });

  it('next does not exceed last index', async () => {
    await createComponent(makeData({ currentIndex: 2 }));
    component['next']();
    expect(component['currentIndex']).toBe(2);
  });

  // ─── close ───────────────────────────────────────────────────────────────

  it('close calls dialogRef.close()', async () => {
    await createComponent(makeData());
    component['close']();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
