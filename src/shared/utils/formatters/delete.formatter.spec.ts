import { generateDeleteMessage } from './delete.formatter';

describe('generateDeleteMessage', () => {
  it('returns message without identifier when identifier is omitted', () => {
    const result = generateDeleteMessage('Electronics');
    expect(result).toBe('Delete "Electronics"?\n\nThis action cannot be undone.');
  });

  it('includes the identifier in parentheses when provided', () => {
    const result = generateDeleteMessage('John Doe', 'john@example.com');
    expect(result).toBe('Delete "John Doe" (john@example.com)?\n\nThis action cannot be undone.');
  });

  it('omits identifier part when identifier is undefined', () => {
    const result = generateDeleteMessage('Order #123', undefined);
    expect(result).not.toContain('(');
    expect(result).toContain('"Order #123"');
  });

  it('handles an empty string as entity name', () => {
    const result = generateDeleteMessage('');
    expect(result).toBe('Delete ""?\n\nThis action cannot be undone.');
  });

  it('handles entity name with special characters', () => {
    const result = generateDeleteMessage('Category & Items', '#42');
    expect(result).toContain('"Category & Items"');
    expect(result).toContain('(#42)');
  });
});
