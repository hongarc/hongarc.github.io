import { useRef, useEffect } from 'react';

/**
 * A custom hook that returns the previous value of a variable.
 *
 * This hook is useful for comparing current and previous values, implementing
 * change detection, or performing cleanup operations when a value changes.
 *
 * @template T - The type of the value to track
 * @param value - The current value to track
 * @returns The previous value, or undefined on the first render
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const [count, setCount] = useState(0);
 *   const previousCount = usePrevious(count);
 *
 *   useEffect(() => {
 *     if (previousCount !== undefined && count !== previousCount) {
 *       console.log(`Count changed from ${previousCount} to ${count}`);
 *     }
 *   }, [count, previousCount]);
 *
 *   return (
 *     <button onClick={() => setCount(c => c + 1)}>
 *       Count: {count}
 *     </button>
 *   );
 * };
 * ```
 *
 * @example
 * ```tsx
 * // Tracking form field changes
 * const [email, setEmail] = useState('');
 * const previousEmail = usePrevious(email);
 *
 * useEffect(() => {
 *   if (previousEmail && email !== previousEmail) {
 *     // Email changed, trigger validation
 *     validateEmail(email);
 *   }
 * }, [email, previousEmail]);
 * ```
 *
 * @example
 * ```tsx
 * // Implementing cleanup on value change
 * const [userId, setUserId] = useState(null);
 * const previousUserId = usePrevious(userId);
 *
 * useEffect(() => {
 *   if (previousUserId && userId !== previousUserId) {
 *     // User changed, cleanup previous user's data
 *     cleanupUserData(previousUserId);
 *   }
 * }, [userId, previousUserId]);
 * ```
 */
export default function usePrevious<T>(value: T): T | undefined {
  const reference = useRef<T | undefined>(undefined);

  useEffect(() => {
    reference.current = value;
  }, [value]);

  return reference.current;
}
