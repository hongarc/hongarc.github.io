import { useState } from 'react';

/**
 * A custom hook that provides localStorage functionality with React state.
 *
 * This hook automatically syncs state with localStorage and handles
 * serialization/deserialization of values. It also provides a way to
 * remove items from localStorage.
 *
 * @param key - The localStorage key
 * @param defaultValue - The default value if no value exists in localStorage
 * @returns A tuple with the current value and a setter function
 *
 * @example
 * ```tsx
 * const [user, setUser] = useLocalStorage('user', { name: 'John', age: 30 });
 *
 * // Update the value
 * setUser({ name: 'Jane', age: 25 });
 *
 * // The value is automatically saved to localStorage
 * ```
 *
 * @example
 * ```tsx
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 *
 * const toggleTheme = () => {
 *   setTheme(theme === 'light' ? 'dark' : 'light');
 * };
 * ```
 *
 * @example
 * ```tsx
 * const [items, setItems] = useLocalStorage('items', []);
 *
 * const addItem = (item) => {
 *   setItems([...items, item]);
 * };
 * ```
 */
export default function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((previous: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = globalThis.localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      // Handle special cases
      if (item === 'undefined') {
        return undefined as T;
      }
      if (item === 'null') {
        return null as T;
      }

      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  });

  const setValue = (value: T | ((previous: T) => T)) => {
    try {
      const valueToStore =
        typeof value === 'function'
          ? (value as (previous: T) => T)(storedValue)
          : value;
      setStoredValue(valueToStore);

      // Handle special cases for localStorage
      if (valueToStore === undefined) {
        globalThis.localStorage.setItem(key, 'undefined');
      } else if (valueToStore === null) {
        globalThis.localStorage.setItem(key, 'null');
      } else {
        globalThis.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch {
      // Ignore write errors
    }
  };

  return [storedValue, setValue];
}
