import {
  DEFAULT_PRODUCT_IMAGE,
  MAX_IMAGE_FILE_SIZE,
  MAX_PRODUCT_IMAGES,
} from './product.constants';

describe('product.constants', () => {
  it('DEFAULT_PRODUCT_IMAGE is the placeholder svg path', () => {
    expect(DEFAULT_PRODUCT_IMAGE).toBe('/product-placeholder.svg');
  });

  it('MAX_PRODUCT_IMAGES is 10', () => {
    expect(MAX_PRODUCT_IMAGES).toBe(10);
  });

  it('MAX_IMAGE_FILE_SIZE is 5MB in bytes', () => {
    expect(MAX_IMAGE_FILE_SIZE).toBe(5 * 1024 * 1024);
  });
});
