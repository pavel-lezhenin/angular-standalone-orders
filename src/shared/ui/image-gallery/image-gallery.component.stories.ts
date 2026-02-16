import type { Meta, StoryObj } from '@storybook/angular';
import { ImageGalleryComponent, ImageItem } from './image-gallery.component';

const mockImages: ImageItem[] = [
  {
    fileId: '1',
    url: '/products/headphones.svg',
    filename: 'headphones.svg',
  },
  {
    fileId: '2',
    url: '/products/laptop.svg',
    filename: 'laptop.svg',
  },
  {
    fileId: '3',
    url: '/products/smartphone.svg',
    filename: 'smartphone.svg',
  },
];

const meta: Meta<ImageGalleryComponent> = {
  title: 'Shared/UI/ImageGallery',
  component: ImageGalleryComponent,
  tags: ['autodocs'],
  args: {
    images: [],
    maxImages: 10,
    maxFileSize: 5 * 1024 * 1024,
    isUploading: false,
    disabled: false,
  },
  argTypes: {
    fileUpload: {
      action: 'fileUpload',
    },
    fileDelete: {
      action: 'fileDelete',
    },
    orderChange: {
      action: 'orderChange',
    },
    setPrimary: {
      action: 'setPrimary',
    },
  },
};

export default meta;
type Story = StoryObj<ImageGalleryComponent>;

export const Empty: Story = {
  args: {
    images: [],
  },
};

export const WithImages: Story = {
  args: {
    images: mockImages,
  },
};

export const SingleImage: Story = {
  args: {
    images: [mockImages[0]!],
  },
};

export const ManyImages: Story = {
  args: {
    images: [
      ...mockImages,
      {
        fileId: '4',
        url: '/products/watch.svg',
        filename: 'watch.svg',
      },
      {
        fileId: '5',
        url: '/products/camera.svg',
        filename: 'camera.svg',
      },
      {
        fileId: '6',
        url: '/products/book.svg',
        filename: 'book.svg',
      },
    ],
  },
};

export const Uploading: Story = {
  args: {
    images: mockImages,
    isUploading: true,
  },
};

export const Disabled: Story = {
  args: {
    images: mockImages,
    disabled: true,
  },
};

export const MaxImagesReached: Story = {
  args: {
    images: [
      { fileId: '1', url: '/products/headphones.svg', filename: 'headphones.svg' },
      { fileId: '2', url: '/products/laptop.svg', filename: 'laptop.svg' },
      { fileId: '3', url: '/products/smartphone.svg', filename: 'smartphone.svg' },
      { fileId: '4', url: '/products/watch.svg', filename: 'watch.svg' },
      { fileId: '5', url: '/products/camera.svg', filename: 'camera.svg' },
      { fileId: '6', url: '/products/book.svg', filename: 'book.svg' },
      { fileId: '7', url: '/products/tshirt.svg', filename: 'tshirt.svg' },
      { fileId: '8', url: '/products/sneakers.svg', filename: 'sneakers.svg' },
      { fileId: '9', url: '/products/electronics.svg', filename: 'electronics.svg' },
      { fileId: '10', url: '/products/clothing.svg', filename: 'clothing.svg' },
    ],
    maxImages: 10,
  },
};

export const CustomMaxImages: Story = {
  args: {
    images: mockImages,
    maxImages: 5,
  },
};
