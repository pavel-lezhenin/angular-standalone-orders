import {
  baseDialogConfig,
  confirmDialogConfig,
  confirmDialogConfigFor,
  createFormDialogConfig,
  deleteDialogConfig,
  deleteDialogConfigFor,
  editFormDialogConfig,
  formDialogConfig,
} from './dialog.config';

describe('dialog.config', () => {
  describe('baseDialogConfig', () => {
    it('has width 400px', () => {
      expect(baseDialogConfig.width).toBe('400px');
    });

    it('has maxWidth 90vw', () => {
      expect(baseDialogConfig.maxWidth).toBe('90vw');
    });

    it('disableClose is false', () => {
      expect(baseDialogConfig.disableClose).toBe(false);
    });
  });

  describe('formDialogConfig', () => {
    it('has width 500px', () => {
      expect(formDialogConfig.width).toBe('500px');
    });

    it('disableClose is true', () => {
      expect(formDialogConfig.disableClose).toBe(true);
    });
  });

  describe('confirmDialogConfig', () => {
    it('includes type "confirm" in data', () => {
      expect((confirmDialogConfig.data as Record<string, unknown>)['type']).toBe('confirm');
    });

    it('includes cancelLabel "Cancel"', () => {
      expect((confirmDialogConfig.data as Record<string, unknown>)['cancelLabel']).toBe('Cancel');
    });
  });

  describe('deleteDialogConfig', () => {
    it('includes title "Delete"', () => {
      expect((deleteDialogConfig.data as Record<string, unknown>)['title']).toBe('Delete');
    });

    it('includes submitLabel "Delete"', () => {
      expect((deleteDialogConfig.data as Record<string, unknown>)['submitLabel']).toBe('Delete');
    });
  });

  describe('createFormDialogConfig', () => {
    it('returns config with mode "create" and given title/submitLabel', () => {
      const cfg = createFormDialogConfig('Create User', 'Save');
      expect((cfg.data as Record<string, unknown>)['mode']).toBe('create');
      expect((cfg.data as Record<string, unknown>)['title']).toBe('Create User');
      expect((cfg.data as Record<string, unknown>)['submitLabel']).toBe('Save');
    });

    it('uses formDialogConfig as base (width 500px)', () => {
      const cfg = createFormDialogConfig('Title', 'OK');
      expect(cfg.width).toBe('500px');
    });
  });

  describe('editFormDialogConfig', () => {
    it('returns config with mode "edit" and entity', () => {
      const entity = { id: 1, name: 'Alice' };
      const cfg = editFormDialogConfig(entity, 'Edit User');
      expect((cfg.data as Record<string, unknown>)['mode']).toBe('edit');
      expect((cfg.data as Record<string, unknown>)['user']).toEqual(entity);
      expect((cfg.data as Record<string, unknown>)['title']).toBe('Edit User');
    });

    it('uses custom entityKey when provided', () => {
      const entity = { id: 2 };
      const cfg = editFormDialogConfig(entity, 'Edit Product', 'product');
      expect((cfg.data as Record<string, unknown>)['product']).toEqual(entity);
    });
  });

  describe('confirmDialogConfigFor', () => {
    it('returns config with the given title, message and submitLabel', () => {
      const cfg = confirmDialogConfigFor('Are you sure?', 'This will delete the item', 'Yes');
      const data = cfg.data as Record<string, unknown>;
      expect(data['title']).toBe('Are you sure?');
      expect(data['message']).toBe('This will delete the item');
      expect(data['submitLabel']).toBe('Yes');
    });

    it('preserves type "confirm" from base confirmDialogConfig', () => {
      const cfg = confirmDialogConfigFor('T', 'M', 'OK');
      expect((cfg.data as Record<string, unknown>)['type']).toBe('confirm');
    });
  });

  describe('deleteDialogConfigFor', () => {
    it('returns config with the given message', () => {
      const cfg = deleteDialogConfigFor('Delete this record?');
      expect((cfg.data as Record<string, unknown>)['message']).toBe('Delete this record?');
    });

    it('inherits title "Delete" from deleteDialogConfig', () => {
      const cfg = deleteDialogConfigFor('msg');
      expect((cfg.data as Record<string, unknown>)['title']).toBe('Delete');
    });
  });
});
