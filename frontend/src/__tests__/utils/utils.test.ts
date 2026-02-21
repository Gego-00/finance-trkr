import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, cn } from '../../lib/utils';

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(0.99)).toBe('$0.99');
    });

    it('should format negative numbers correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
      expect(formatCurrency(-100)).toBe('-$100.00');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });
  });

  describe('formatDate', () => {
    it('should format date strings correctly', () => {
      const result1 = formatDate('2024-01-15');
      expect(result1).toContain('Jan');
      expect(result1).toContain('15');
      expect(result1).toContain('2024');

      const result2 = formatDate('2024-12-25');
      expect(result2).toContain('Dec');
      expect(result2).toContain('25');
      expect(result2).toContain('2024');
    });

    it('should handle different date formats', () => {
      // Use a date string directly to avoid timezone issues
      const formatted = formatDate('2024-06-15');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('Jun');
      expect(formatted).toContain('15');
    });
  });

  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'excluded');
      expect(result).toContain('base');
      expect(result).toContain('conditional');
      expect(result).not.toContain('excluded');
    });

    it('should handle tailwind merge conflicts', () => {
      const result = cn('px-2', 'px-4');
      // px-4 should override px-2
      expect(result).toBe('px-4');
    });

    it('should handle undefined and null', () => {
      const result = cn('base', undefined, null, 'other');
      expect(result).toContain('base');
      expect(result).toContain('other');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });
});
