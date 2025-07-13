# HongArc Project Specification

## Project Overview

HongArc is a Docusaurus-based documentation site that provides various utility converters and tools for developers. The project focuses on providing interactive converters for common development tasks like string manipulation, data format conversion, timestamp conversion, and more.

## Project Structure

### Core Directories

```
hongarc/
├── src/
│   ├── components/          # React components (kebab-case naming)
│   ├── converters/          # Utility functions for conversions
│   ├── css/                 # Global CSS files
│   ├── hooks/               # Custom React hooks
│   └── pages/               # Docusaurus pages
├── docs/                    # Documentation content
├── blog/                    # Blog posts
└── static/                  # Static assets
```

## Coding Standards & Rules

### 1. File Naming Convention

- **Components**: Use kebab-case for all component files
  - ✅ `id-generator.tsx`
  - ❌ `IdGenerator.tsx`
- **Converters**: Use kebab-case for utility files
  - ✅ `byte-size-converters.ts`
  - ❌ `byteSizeConverters.ts`

### 2. Component Structure

- Use functional components with TypeScript
- Export components as default exports
- Use styled-components for styling (no manual CSS in components)
- Follow React hooks best practices

### 3. Styling Guidelines

- **Use styled-components exclusively** - no manual CSS in component files
- **No inline styles** - replace all `style={{...}}` with styled-components
- Use CSS variables from Docusaurus theme: `var(--ifm-color-*)`
- Follow responsive design principles
- Maintain consistent spacing and typography
- **Status**: 3/6 components fully converted (id-generator, byte-size-converter, data-format-converter)

### 4. Error Handling

- Handle errors silently in UI components (no console.error)
- Provide user-friendly error messages
- Use try-catch blocks for clipboard operations

### 5. State Management

- Use React hooks (useState, useEffect) for local state
- Implement localStorage for user preferences
- Use custom hooks for reusable logic (useDebounce, useThrottle)

### 6. TypeScript Guidelines

- Define interfaces for component props
- Use proper typing for all functions
- Avoid `any` types when possible
- Use union types for multiple options

### 7. ESLint Rules

- Follow unicorn/filename-case (kebab-case)
- Use unicorn/consistent-function-scoping
- Use unicorn/prevent-abbreviations (event instead of e)
- No console statements in production code
- Maintain cognitive complexity under 20

### 8. Throttling & Debouncing

- All converter components must throttle/delay the conversion logic, not the input updates.
- Use the custom `useThrottle` hook to delay conversion function calls, allowing immediate input updates for better UX.
- Use the custom `useDebounce` hook for search operations or form validation that should wait for user to stop typing.
- Do not throttle or debounce input state; only throttle the expensive conversion or output logic.
- This pattern is required for all new and existing converter components.

### 9. Custom Hooks

The project includes several reusable custom hooks for common patterns:

#### useThrottle

- **Purpose**: Throttles function calls to limit execution frequency
- **Use Case**: Expensive operations like API calls or heavy computations
- **Pattern**: Immediate input updates, delayed conversion calls
- **Example**: `const throttledConversion = useThrottle((value) => convert(value), 300);`

#### useDebounce

- **Purpose**: Debounces function calls to delay execution until after a delay period
- **Use Case**: Search operations, form validation, API calls after user stops typing
- **Pattern**: Waits for user to stop interacting before executing
- **Example**: `const debouncedSearch = useDebounce((term) => search(term), 500);`

#### useLocalStorage

- **Purpose**: Synchronizes state with localStorage with automatic serialization
- **Use Case**: User preferences, form data persistence, settings
- **Pattern**: Works like useState but with localStorage persistence
- **Example**: `const [theme, setTheme] = useLocalStorage('app-theme', 'light');`

#### usePrevious

- **Purpose**: Returns the previous value of a variable
- **Use Case**: Change detection, cleanup operations, comparison logic
- **Pattern**: Tracks previous value for comparison or cleanup
- **Example**: `const previousCount = usePrevious(count);`

#### useIsMounted

- **Purpose**: Returns a ref indicating if component is currently mounted
- **Use Case**: Preventing state updates on unmounted components, avoiding memory leaks
- **Pattern**: Safe async operations and cleanup
- **Example**: `const isMounted = useIsMounted(); if (isMounted.current) { setData(result); }`

### 10. Hook Usage Guidelines

- **Prefer useLocalStorage over manual localStorage**: Provides type safety and error handling
- **Use useThrottle for expensive operations**: Conversion functions, API calls, heavy computations
- **Use useDebounce for user input**: Search, validation, form submission
- **Use usePrevious for change detection**: Comparing current vs previous values
- **Use useIsMounted for async operations**: Preventing memory leaks and state updates on unmounted components

## Component Patterns

### Converter Components

All converter components should follow this pattern:

```typescript
interface ComponentProps {
  // Define props interface
}

const StyledComponent = styled.div`
  // Use styled-components
`;

export default function ComponentName() {
  const [state, setState] = useState();

  // Handle errors silently
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Silently handle copy errors
    }
  };

  return (
    <StyledComponent>
      {/* Component content */}
    </StyledComponent>
  );
}
```

### Utility Functions

- Place in `src/converters/` directory
- Export named functions
- Include comprehensive error handling
- Add TypeScript types for all parameters and return values

## Available Converters

### String Converters

- Uppercase/Lowercase
- CamelCase/KebabCase/SnakeCase
- Capitalize/Trim/Deburr
- Escape/Unescape

### Data Format Converters

- Any format ↔ Any format (JSON, YAML, XML, CSV, Query String)
- Bidirectional conversion between all supported formats
- Automatic format detection and validation

### Utility Converters

- Byte Size Converter
- Color Converter (HEX, RGB, HSL, HSV, CMYK)
- Timestamp Converter
- ID Generator (UUID, NanoID, CUID, ULID, HEX)

## Development Workflow

### Adding New Converters

1. Create converter function in `src/converters/`
2. Create component in `src/components/` (kebab-case)
3. Add documentation in `docs/converter/`
4. Update navigation in `sidebars.ts`
5. Add tests in `src/converters/__tests__/`

### Component Updates

1. Follow existing patterns
2. Use styled-components for styling
3. Handle errors gracefully
4. Add TypeScript interfaces
5. Update spec file if patterns change

### Styling Updates

1. Use Docusaurus CSS variables
2. Maintain responsive design
3. Follow accessibility guidelines
4. Test in light/dark themes

## Testing Guidelines

- Unit tests for converter functions
- Component tests for UI interactions
- Test error handling scenarios
- Maintain good test coverage

## Performance Guidelines

- Use React.memo for expensive components
- Implement debouncing for input handlers
- Optimize bundle size
- Use lazy loading where appropriate

## Accessibility

- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios

## Browser Support

- Modern browsers (ES6+)
- Mobile responsive design
- Progressive enhancement

## Deployment

- Docusaurus build process
- GitHub Pages deployment
- Automated testing on PR
- ESLint checks in CI/CD

## Maintenance Rules

### When Updating Code

1. Follow existing patterns
2. Update this spec file if introducing new patterns
3. Maintain backward compatibility
4. Update documentation

### When Adding Features

1. Check existing patterns first
2. Follow established conventions
3. Update relevant documentation
4. Add appropriate tests

### When Fixing Issues

1. Identify root cause
2. Follow existing error handling patterns
3. Test thoroughly
4. Update spec if needed

## Version Control

- Use conventional commits
- Create feature branches
- Require PR reviews
- Maintain clean git history

## Documentation

- Keep README.md updated
- Document new patterns in this spec
- Maintain inline code comments
- Update API documentation

---

**Last Updated**: 2025-01-15
**Version**: 1.1.0
**Maintainer**: Development Team
