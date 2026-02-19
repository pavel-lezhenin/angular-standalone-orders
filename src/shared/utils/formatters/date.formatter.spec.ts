import { formatDate, formatDateTime } from './date.formatter';

describe('date.formatter', () => {
  describe('formatDate', () => {
    it('formats a timestamp into a localized date string (en-US)', () => {
      const timestamp = new Date('2024-06-15T10:30:00Z').getTime();
      const result = formatDate(timestamp);
      // e.g. "Jun 15, 2024"
      expect(result).toMatch(/Jun/);
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2024/);
    });

    it('uses default locale en-US', () => {
      const timestamp = new Date('2024-01-01T00:00:00Z').getTime();
      const result = formatDate(timestamp);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('formats with a custom locale', () => {
      const timestamp = new Date('2024-06-15T10:30:00Z').getTime();
      // Should not throw for different locales
      const result = formatDate(timestamp, 'de-DE');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles epoch timestamp (0)', () => {
      const result = formatDate(0);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatDateTime', () => {
    it('formats a timestamp into a localized date-time string (en-US)', () => {
      const timestamp = new Date('2024-06-15T14:30:00Z').getTime();
      const result = formatDateTime(timestamp);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('uses default locale en-US', () => {
      const timestamp = new Date('2024-03-20T08:15:00Z').getTime();
      const result = formatDateTime(timestamp);
      expect(typeof result).toBe('string');
    });

    it('formats with a custom locale', () => {
      const timestamp = new Date('2024-03-20T08:15:00Z').getTime();
      const result = formatDateTime(timestamp, 'fr-FR');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns a string that contains year for a known date', () => {
      // Use a mid-year date that is safely 2025 in any timezone
      const timestamp = new Date('2025-07-15T12:00:00Z').getTime();
      const result = formatDateTime(timestamp);
      expect(result).toMatch(/2025/);
    });
  });
});
