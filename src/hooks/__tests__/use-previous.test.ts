import { renderHook } from '@testing-library/react';

import usePrevious from '../use-previous';

const function1 = () => 'function1';
const function2 = () => 'function2';

describe('usePrevious', () => {
  it('should return undefined on first render', () => {
    const { result } = renderHook(() => usePrevious('initial-value'));

    expect(result.current).toBeUndefined();
  });

  it('should return previous value on subsequent renders', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'first' },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 'second' });
    expect(result.current).toBe('first');

    rerender({ value: 'third' });
    expect(result.current).toBe('second');
  });

  it('should handle primitive values', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 0 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 1 });
    expect(result.current).toBe(0);

    rerender({ value: 2 });
    expect(result.current).toBe(1);
  });

  it('should handle boolean values', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: false },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: true });
    expect(result.current).toBe(false);

    rerender({ value: false });
    expect(result.current).toBe(true);
  });

  it('should handle objects', () => {
    const object1 = { name: 'John', age: 30 };
    const object2 = { name: 'Jane', age: 25 };

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: object1 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: object2 });
    expect(result.current).toBe(object1);
  });

  it('should handle arrays', () => {
    const array1 = [1, 2, 3];
    const array2 = [4, 5, 6];

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: array1 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: array2 });
    expect(result.current).toBe(array1);
  });

  it('should handle null values', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: null },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 'not-null' });
    expect(result.current).toBe(null);

    rerender({ value: null });
    expect(result.current).toBe('not-null');
  });

  it('should handle undefined values', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: undefined },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 'defined' });
    expect(result.current).toBeUndefined();

    rerender({ value: undefined });
    expect(result.current).toBe('defined');
  });

  it('should handle function values', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: function1 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: function2 });
    expect(result.current).toBe(function1);
  });

  it('should maintain reference equality for same values', () => {
    const sameValue = { id: 1 };

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: sameValue },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: sameValue });
    expect(result.current).toBe(sameValue);
  });

  it('should handle multiple re-renders with same value', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'same' },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 'same' });
    expect(result.current).toBe('same');

    rerender({ value: 'same' });
    expect(result.current).toBe('same');
  });
});
