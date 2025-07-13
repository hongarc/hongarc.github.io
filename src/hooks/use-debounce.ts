import { useRef, useCallback } from 'react';

/**
 * A custom hook that debounces function calls to delay their execution until after
 * a specified delay period has passed without any new calls.
 *
 * This hook is useful for delaying expensive operations (like API calls or search queries)
 * until the user has stopped typing or interacting. The debounced function will only
 * execute after the specified delay has passed without any new calls.
 *
 * @template T - The type of the function to debounce
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds to wait before executing
 * @returns A debounced version of the callback function
 *
 * @example
 * ```tsx
 * const SearchComponent = () => {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const [results, setResults] = useState([]);
 *
 *   // Debounce the search API call
 *   const debouncedSearch = useDebounce(async (term: string) => {
 *     const searchResults = await searchApi(term);
 *     setResults(searchResults);
 *   }, 500);
 *
 *   useEffect(() => {
 *     if (searchTerm) {
 *       debouncedSearch(searchTerm);
 *     }
 *   }, [searchTerm, debouncedSearch]);
 *
 *   return (
 *     <input
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * };
 * ```
 *
 * @example
 * ```tsx
 * // Debouncing form validation
 * const debouncedValidate = useDebounce((email: string) => {
 *   const isValid = validateEmail(email);
 *   setEmailError(!isValid);
 * }, 300);
 *
 * // Only validates after user stops typing for 300ms
 * debouncedValidate(email);
 * ```
 */
export default function useDebounce<T extends (...arguments_: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutReference = useRef<number | null>(null);

  return useCallback(
    (...arguments_: Parameters<T>) => {
      if (timeoutReference.current) {
        clearTimeout(timeoutReference.current);
      }
      timeoutReference.current = setTimeout(() => {
        callback(...arguments_);
      }, delay) as unknown as number;
    },
    [callback, delay]
  ) as T;
}
