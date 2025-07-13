import { renderHook, act } from '@testing-library/react';

import useThrottle from '../use-throttle';

describe('useThrottle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should throttle function calls', () => {
    const mockFunction = jest.fn();
    const { result } = renderHook(() => useThrottle(mockFunction, 100));

    // Call multiple times quickly
    act(() => {
      result.current('test1');
      result.current('test2');
      result.current('test3');
    });

    // Should be called immediately with first value
    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(mockFunction).toHaveBeenCalledWith('test1');

    // Clear mock
    mockFunction.mockClear();

    // Advance time and call again
    act(() => {
      jest.advanceTimersByTime(100);
      result.current('test4');
    });

    expect(mockFunction).toHaveBeenCalledWith('test4');
  });

  it('should use default delay of 300ms', () => {
    const mockFunction = jest.fn();
    const { result } = renderHook(() => useThrottle(mockFunction, 300));

    act(() => {
      result.current('test');
    });

    expect(mockFunction).toHaveBeenCalledWith('test');
  });

  it('should ignore calls during throttle period', () => {
    const mockFunction = jest.fn();
    const { result } = renderHook(() => useThrottle(mockFunction, 100));

    act(() => {
      result.current('first');
    });

    expect(mockFunction).toHaveBeenCalledWith('first');
    mockFunction.mockClear();

    // Call again immediately - should be ignored
    act(() => {
      result.current('second');
    });

    expect(mockFunction).not.toHaveBeenCalled();

    // Advance time and call again
    act(() => {
      jest.advanceTimersByTime(100);
      result.current('third');
    });

    expect(mockFunction).toHaveBeenCalledWith('third');
  });

  it('should handle multiple rapid calls', () => {
    const mockFunction = jest.fn();
    const { result } = renderHook(() => useThrottle(mockFunction, 50));

    // Make many rapid calls
    act(() => {
      for (let index = 0; index < 10; index++) {
        result.current(`call${index}`);
      }
    });

    // Should only be called once with first value
    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(mockFunction).toHaveBeenCalledWith('call0');
  });

  it('should handle function with multiple arguments', () => {
    const mockFunction = jest.fn();
    const { result } = renderHook(() => useThrottle(mockFunction, 100));

    act(() => {
      result.current('arg1', 'arg2', { key: 'value' });
    });

    expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' });
  });

  it('should handle empty calls', () => {
    const mockFunction = jest.fn();
    const { result } = renderHook(() => useThrottle(mockFunction, 100));

    act(() => {
      result.current();
    });

    expect(mockFunction).toHaveBeenCalledWith();
  });

  it('should maintain function reference between renders', () => {
    const mockFunction = jest.fn();
    const { result, rerender } = renderHook(() =>
      useThrottle(mockFunction, 100)
    );

    const firstCall = result.current;

    rerender();

    expect(result.current).toBe(firstCall);
  });
});
