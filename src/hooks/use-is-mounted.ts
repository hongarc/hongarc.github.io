import { useRef, useEffect } from 'react';

/**
 * A custom hook that returns a ref indicating whether the component is currently mounted.
 *
 * This hook is useful for preventing state updates on unmounted components,
 * avoiding memory leaks, and handling async operations safely.
 *
 * @returns A ref object with a boolean value indicating mount status
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const [data, setData] = useState(null);
 *   const isMounted = useIsMounted();
 *
 *   useEffect(() => {
 *     const fetchData = async () => {
 *       const result = await api.getData();
 *
 *       // Only update state if component is still mounted
 *       if (isMounted.current) {
 *         setData(result);
 *       }
 *     };
 *
 *     fetchData();
 *   }, [isMounted]);
 *
 *   return <div>{data ? data.name : 'Loading...'}</div>;
 * };
 * ```
 *
 * @example
 * ```tsx
 * // Preventing memory leaks in async operations
 * const [loading, setLoading] = useState(false);
 * const isMounted = useIsMounted();
 *
 * const handleSubmit = async () => {
 *   setLoading(true);
 *
 *   try {
 *     await submitForm();
 *
 *     // Only update UI if component is still mounted
 *     if (isMounted.current) {
 *       setLoading(false);
 *       showSuccessMessage();
 *     }
 *   } catch (error) {
 *     if (isMounted.current) {
 *       setLoading(false);
 *       showErrorMessage(error);
 *     }
 *   }
 * };
 * ```
 *
 * @example
 * ```tsx
 * // Safe cleanup in useEffect
 * const isMounted = useIsMounted();
 *
 * useEffect(() => {
 *   const timer = setTimeout(() => {
 *     if (isMounted.current) {
 *       // Only execute if component is still mounted
 *       performAction();
 *     }
 *   }, 1000);
 *
 *   return () => clearTimeout(timer);
 * }, [isMounted]);
 * ```
 */
export default function useIsMounted(): React.RefObject<boolean> {
  const isMountedReference = useRef(true);

  useEffect(() => {
    isMountedReference.current = true;
    return () => {
      isMountedReference.current = false;
    };
  }, []);

  return isMountedReference;
}
