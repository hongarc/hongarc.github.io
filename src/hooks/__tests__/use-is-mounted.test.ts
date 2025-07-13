import { renderHook, act } from '@testing-library/react';

import useIsMounted from '../use-is-mounted';

describe('useIsMounted', () => {
  it('should return true when component is mounted', () => {
    const { result } = renderHook(() => useIsMounted());
    expect(result.current.current).toBe(true);
  });

  it('should return false when component is unmounted', () => {
    const { result, unmount } = renderHook(() => useIsMounted());
    expect(result.current.current).toBe(true);
    act(() => {
      unmount();
    });
    expect(result.current.current).toBe(false);
  });

  it('should maintain consistent reference', () => {
    const { result, rerender } = renderHook(() => useIsMounted());
    const firstCall = result.current;
    rerender();
    expect(result.current).toBe(firstCall);
  });

  it('should work with multiple instances', () => {
    const { result: result1 } = renderHook(() => useIsMounted());
    const { result: result2 } = renderHook(() => useIsMounted());
    expect(result1.current.current).toBe(true);
    expect(result2.current.current).toBe(true);
    expect(result1.current).not.toBe(result2.current);
  });

  it('should handle rapid mount/unmount cycles', () => {
    // Test mount
    const { result: result1, unmount: unmount1 } = renderHook(() =>
      useIsMounted()
    );
    expect(result1.current.current).toBe(true);

    // Test unmount
    act(() => {
      unmount1();
    });
    expect(result1.current.current).toBe(false);

    // Test remount with new instance
    const { result: result2 } = renderHook(() => useIsMounted());
    expect(result2.current.current).toBe(true);
  });
});
