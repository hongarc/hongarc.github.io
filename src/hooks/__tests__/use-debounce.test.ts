import { renderHook, act } from '@testing-library/react';

import useDebounce from '../use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce function calls', async () => {
    const mockFunction = jest.fn();
    const { result } = renderHook(() => useDebounce(mockFunction, 100));

    // Call multiple times quickly
    act(() => {
      result.current('test1');
      result.current('test2');
      result.current('test3');
    });

    // Function should not be called immediately
    expect(mockFunction).not.toHaveBeenCalled();

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should only be called once with the last value
    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(mockFunction).toHaveBeenCalledWith('test3');
  });

  it('should use default delay of 300ms', () => {
    const mockFunction = jest.fn();
    const { result } = renderHook(() => useDebounce(mockFunction, 300));

    act(() => {
      result.current('test');
    });

    expect(mockFunction).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockFunction).toHaveBeenCalledWith('test');
  });

  it('should cancel previous calls when new call is made', () => {
    const mockFunction = jest.fn();
    const { result } = renderHook(() => useDebounce(mockFunction, 100));

    act(() => {
      result.current('first');
    });

    // Advance time but not enough to trigger
    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(mockFunction).not.toHaveBeenCalled();

    // Make another call
    act(() => {
      result.current('second');
    });

    // Advance time to trigger the second call
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(mockFunction).toHaveBeenCalledWith('second');
  });

  it('should handle multiple rapid calls', () => {
    const mockFunction = jest.fn();
    const { result } = renderHook(() => useDebounce(mockFunction, 50));

    // Make many rapid calls
    act(() => {
      for (let index = 0; index < 10; index++) {
        result.current(`call${index}`);
      }
    });

    expect(mockFunction).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(mockFunction).toHaveBeenCalledWith('call9');
  });

  it('should handle function with multiple arguments', () => {
    const mockFunction = jest.fn();
    const { result } = renderHook(() => useDebounce(mockFunction, 100));

    act(() => {
      result.current('arg1', 'arg2', { key: 'value' });
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' });
  });

  it('should handle empty calls', () => {
    const mockFunction = jest.fn();
    const { result } = renderHook(() => useDebounce(mockFunction, 100));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockFunction).toHaveBeenCalledWith();
  });

  it('should maintain function reference between renders', () => {
    const mockFunction = jest.fn();
    const { result, rerender } = renderHook(() =>
      useDebounce(mockFunction, 100)
    );

    const firstCall = result.current;

    rerender();

    expect(result.current).toBe(firstCall);
  });
});
