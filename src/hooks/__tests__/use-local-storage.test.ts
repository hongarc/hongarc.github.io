import { renderHook, act } from '@testing-library/react';

import useLocalStorage from '../use-local-storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || undefined),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should initialize with default value', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'default-value')
    );

    expect(result.current[0]).toBe('default-value');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should load existing value from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('"existing-value"');

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'default-value')
    );

    expect(result.current[0]).toBe('existing-value');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'default-value')
    );

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-key',
      '"new-value"'
    );
  });

  it('should handle complex objects', () => {
    const complexObject = {
      name: 'test',
      items: [1, 2, 3],
      nested: { key: 'value' },
    };
    const { result } = renderHook(() =>
      useLocalStorage('complex-key', complexObject)
    );

    act(() => {
      result.current[1]({ ...complexObject, name: 'updated' });
    });

    expect(result.current[0]).toEqual({ ...complexObject, name: 'updated' });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'complex-key',
      JSON.stringify({ ...complexObject, name: 'updated' })
    );
  });

  it('should handle arrays', () => {
    const array = [1, 2, 3, 'test'];
    const { result } = renderHook(() => useLocalStorage('array-key', array));

    act(() => {
      result.current[1]([...array, 4]);
    });

    expect(result.current[0]).toEqual([1, 2, 3, 'test', 4]);
  });

  it('should handle null values', () => {
    const { result } = renderHook(() => useLocalStorage('null-key', null));

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBeNull();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('null-key', 'null');
  });

  it('should handle undefined values', () => {
    const { result } = renderHook(() =>
      useLocalStorage('undefined-key', undefined)
    );

    act(() => {
      result.current[1](undefined);
    });

    expect(result.current[0]).toBeUndefined();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'undefined-key',
      'undefined'
    );
  });

  it('should handle invalid JSON in localStorage', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');

    const { result } = renderHook(() =>
      useLocalStorage('invalid-key', 'default')
    );

    expect(result.current[0]).toBe('default');
  });

  it('should handle empty string in localStorage', () => {
    localStorageMock.getItem.mockReturnValue('');

    const { result } = renderHook(() =>
      useLocalStorage('empty-key', 'default')
    );

    expect(result.current[0]).toBe('default');
  });

  it('should maintain value across re-renders', () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorage('persistent-key', 'initial')
    );

    act(() => {
      result.current[1]('updated');
    });

    rerender();

    expect(result.current[0]).toBe('updated');
  });

  it('should handle direct value updates', () => {
    const { result } = renderHook(() => useLocalStorage('function-key', 0));

    act(() => {
      result.current[1](1);
    });

    expect(result.current[0]).toBe(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('function-key', '1');
  });

  it('should handle object updates', () => {
    const { result } = renderHook(() =>
      useLocalStorage('nested-key', { count: 0 })
    );

    act(() => {
      result.current[1]({ count: 1 });
    });

    expect(result.current[0]).toEqual({ count: 1 });
  });
});
