import { throttle } from 'lodash';
import { useRef, useCallback } from 'react';

/**
 * A custom hook that throttles function calls to limit their execution frequency.
 *
 * This hook is designed to throttle expensive operations (like API calls or heavy computations)
 * while allowing immediate input updates for better user experience. The throttled function
 * will only execute once per specified delay period, regardless of how many times it's called.
 *
 * @template T - The type of the function to throttle
 * @param callback - The function to throttle
 * @param delay - The delay in milliseconds between allowed executions
 * @returns A throttled version of the callback function
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const [input, setInput] = useState('');
 *   const [output, setOutput] = useState('');
 *
 *   // Throttle the expensive conversion function
 *   const throttledConversion = useThrottle((value: string) => {
 *     const result = expensiveConversion(value);
 *     setOutput(result);
 *   }, 300);
 *
 *   useEffect(() => {
 *     throttledConversion(input);
 *   }, [input, throttledConversion]);
 *
 *   return (
 *     <input
 *       value={input}
 *       onChange={(e) => setInput(e.target.value)} // Immediate update
 *     />
 *   );
 * };
 * ```
 *
 * @example
 * ```tsx
 * // Throttling API calls
 * const throttledApiCall = useThrottle(async (searchTerm: string) => {
 *   const results = await searchApi(searchTerm);
 *   setSearchResults(results);
 * }, 500);
 *
 * // Only executes once per 500ms, even if called multiple times
 * throttledApiCall('react hooks');
 * ```
 */
export default function useThrottle<T extends (...arguments_: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useRef(
    throttle((...arguments_: Parameters<T>) => {
      callback(...arguments_);
    }, delay)
  );

  return useCallback(
    (...arguments_: Parameters<T>) => {
      throttledCallback.current(...arguments_);
    },
    [callback]
  ) as T;
}
