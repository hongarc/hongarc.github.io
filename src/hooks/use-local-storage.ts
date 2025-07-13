import { useState, useEffect } from 'react';

/**
 * A custom hook that synchronizes state with localStorage.
 *
 * This hook provides a simple way to persist component state in localStorage
 * with automatic serialization/deserialization and error handling. It works
 * exactly like useState but with localStorage persistence.
 *
 * @template T - The type of the value to store
 * @param key - The localStorage key to use for storage
 * @param defaultValue - The default value if no value exists in localStorage
 * @returns A tuple containing the current value and a setter function
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const [theme, setTheme] = useLocalStorage('app-theme', 'light');
 *   const [userPreferences, setUserPreferences] = useLocalStorage('user-prefs', {
 *     notifications: true,
 *     language: 'en'
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *         Current theme: {theme}
 *       </button>
 *       <button onClick={() => setUserPreferences(prev => ({
 *         ...prev,
 *         notifications: !prev.notifications
 *       }))}>
 *         Toggle notifications
 *       </button>
 *     </div>
 *   );
 * };
 * ```
 *
 * @example
 * ```tsx
 * // Form with persistent state
 * const ContactForm = () => {
 *   const [formData, setFormData] = useLocalStorage('contact-form', {
 *     name: '',
 *     email: '',
 *     message: ''
 *   });
 *
 *   const handleChange = (field: string, value: string) => {
 *     setFormData(prev => ({
 *       ...prev,
 *       [field]: value
 *     }));
 *   };
 *
 *   return (
 *     <form>
 *       <input
 *         value={formData.name}
 *         onChange={(e) => handleChange('name', e.target.value)}
 *         placeholder="Name"
 *       />
 *       <input
 *         value={formData.email}
 *         onChange={(e) => handleChange('email', e.target.value)}
 *         placeholder="Email"
 *       />
 *       <textarea
 *         value={formData.message}
 *         onChange={(e) => handleChange('message', e.target.value)}
 *         placeholder="Message"
 *       />
 *     </form>
 *   );
 * };
 * ```
 *
 * @example
 * ```tsx
 * // Settings with type safety
 * interface Settings {
 *   autoSave: boolean;
 *   fontSize: number;
 *   language: 'en' | 'es' | 'fr';
 * }
 *
 * const SettingsComponent = () => {
 *   const [settings, setSettings] = useLocalStorage<Settings>('app-settings', {
 *     autoSave: true,
 *     fontSize: 14,
 *     language: 'en'
 *   });
 *
 *   const updateSetting = <K extends keyof Settings>(
 *     key: K,
 *     value: Settings[K]
 *   ) => {
 *     setSettings(prev => ({
 *       ...prev,
 *       [key]: value
 *     }));
 *   };
 *
 *   return (
 *     <div>
 *       <label>
 *         <input
 *           type="checkbox"
 *           checked={settings.autoSave}
 *           onChange={(e) => updateSetting('autoSave', e.target.checked)}
 *         />
 *         Auto Save
 *       </label>
 *       <select
 *         value={settings.language}
 *         onChange={(e) => updateSetting('language', e.target.value as Settings['language'])}
 *       >
 *         <option value="en">English</option>
 *         <option value="es">Spanish</option>
 *         <option value="fr">French</option>
 *       </select>
 *     </div>
 *   );
 * };
 * ```
 */
export default function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = globalThis.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      globalThis.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Ignore write errors
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
