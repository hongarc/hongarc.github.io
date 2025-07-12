import { useState, useEffect, useRef } from 'react';
import { throttle } from 'lodash';

export default function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const throttledSetValue = useRef(
    throttle((newValue: T) => {
      setThrottledValue(newValue);
    }, delay)
  );

  useEffect(() => {
    throttledSetValue.current(value);
  }, [value]);

  useEffect(() => {
    return () => {
      throttledSetValue.current.cancel();
    };
  }, []);

  return throttledValue;
}