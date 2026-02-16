import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImageZoomDialogComponent, ImageZoomDialogData } from './image-zoom-dialog.component';

const mockDialogRef = {
  close: () => {},
};

const mockImages = [
  '/products/headphones.svg',
  '/products/laptop.svg',
  '/products/smartphone.svg',
];

const meta: Meta<ImageZoomDialogComponent> = {
  title: 'Shared/UI/ImageZoomDialog',
  component: ImageZoomDialogComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ImageZoomDialogComponent>;

export const FirstImage: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            images: mockImages,
            currentIndex: 0,
            productName: 'Premium Headphones',
          } as ImageZoomDialogData,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }),
  ],
};

export const MiddleImage: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            images: mockImages,
            currentIndex: 1,
            productName: 'Premium Headphones',
          } as ImageZoomDialogData,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }),
  ],
};

export const LastImage: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            images: mockImages,
            currentIndex: 2,
            productName: 'Premium Headphones',
          } as ImageZoomDialogData,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }),
  ],
};

export const SingleImage: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            images: [mockImages[0]!],
            currentIndex: 0,
            productName: 'Simple Product',
          } as ImageZoomDialogData,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }),
  ],
};

export const ManyImages: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            images: [
              ...mockImages,
              '/products/watch.svg',
              '/products/camera.svg',
              '/products/book.svg',
            ],
            currentIndex: 2,
            productName: 'Premium Product Collection',
          } as ImageZoomDialogData,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }),
  ],
};
