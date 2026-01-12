# Friendly Toolbox

A fast, modern developer utility hub built with React 19, Domain-Driven Design (DDD), and functional programming principles.

## Features

- **30+ Developer Tools** - VietQR, JWT decoder, SQL formatter, Crypto tools, and more
- **Instant Results** - Auto-transform as you type with 300ms debounce
- **Privacy First** - All processing happens locally in your browser
- **Clean Architecture** - Separation of concerns using DDD and Strategy patterns
- **Keyboard Shortcuts** - Quick navigation with `Cmd+K` command palette
- **Offline Ready** - Works without internet connection
- **Dark Mode** - System preference detection with manual toggle

## Tech Stack

| Category | Technology |
|----------|------------|
| Architecture | **Domain-Driven Design (DDD)** |
| Framework | React 19 + TypeScript |
| Logic | Pure TypeScript Domain Services |
| Testing | Vitest (100% Domain Coverage) |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Functional | Ramda.js |

## Architecture

This project follows strict **Domain-Driven Design** principles:

- **`src/domain/`**: Pure TypeScript business logic (Zero UI dependencies).
- **`src/plugins/`**: UI-specific integration (React components).
- **`src/__tests__/`**: Comprehensive unit tests for all domain logic.

**Key Patterns:**
- **Strategy Pattern**: For diverse output rendering (QR codes, Diffs, JSON, etc.).
- **Factory Pattern**: For dynamic tool creation.
- **Observer Pattern**: For reactive settings management.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run comprehensive test suite
npm test

# Build for production
npm run build
```

## Testing

We maintain high code quality with a comprehensive test suite covering all business logic:

```bash
# Run all tests
npm test

# Watch mode
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 🛠 Available Tools

### 🏦 Finance (New!)
- **VietQR Generator** - Create standard compliant bank transfer QR codes (Ticket Style)

### 📝 Text & String
- Case Converter, Text Diff, Line Tools
- UUID/CUID/ObjectId Generators
- Lorem Ipsum, Slug Generator, Regex Tester

### 🎨 Formatters
- JSON Formatter/Minifier, SQL Formatter
- YAML ↔ JSON, Markdown Preview

### 🔒 Crypto & Security
- Hash Generator (SHA-256, MD5, etc.)
- Password Generator (with entropy calculation)
- HMAC Generator

### 🛠 Development
- JWT Decoder (Auth0/Firebase compatible)
- URL Parser, Cron Parser, Unix Timestamp
- Base64/URL/HTML Encoders

## Deployment (CI/CD)

The project includes a fully automated GitHub Actions pipeline (`deploy.yml`) that:
1. Lint & Check Types
2. Run Unit Tests
3. Build the Application
4. Auto-deploy to GitHub Pages (on `main` branch)

## Adding New Tools

1. **Create Domain Service** (`src/domain/my-tool/service.ts`):
   ```typescript
   // Pure function, easy to test
   export const transformText = (text: string): string => text.toUpperCase();
   ```

2. **Add Unit Tests** (`src/__tests__/my-tool.test.ts`):
   ```typescript
   import { transformText } from '@/domain/my-tool/service';
   test('transforms text', () => expect(transformText('hi')).toBe('HI'));
   ```

3. **Create Plugin** (`src/plugins/my-category/my-tool.tsx`):
   ```typescript
   export const myTool: ToolPlugin = {
     transformer: (inputs) => {
       // Use domain service
       return success(transformText(inputs.text));
     }
   };
   ```

## License

MIT
