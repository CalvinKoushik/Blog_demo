import { cn } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('resolves tailwind conflicts', () => {
      // p-4 should override p-2
      expect(cn('p-2', 'p-4')).toBe('p-4');
    });

    it('handles undefined and null values', () => {
      expect(cn('class1', undefined, 'class2', null)).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
      const isTrue = true;
      const isFalse = false;
      expect(cn('base', isTrue && 'truthy', isFalse && 'falsy')).toBe('base truthy');
    });

    it('handles arrays and objects', () => {
      expect(cn(['class1', 'class2'], { class3: true, class4: false })).toBe('class1 class2 class3');
    });
  });
});
