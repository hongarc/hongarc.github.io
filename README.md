# HongArc - Developer Tools & Converters

A comprehensive collection of developer utilities and converters built with [Docusaurus](https://docusaurus.io/), featuring real-time data format conversion, ID generation, timestamp utilities, color manipulation, and more.

## 🚀 Features

- **Data Format Converters**: JSON ↔ YAML ↔ XML ↔ CSV ↔ Query String
- **ID Generators**: UUID, NanoID, CUID, ULID, HEX
- **Timestamp Converters**: Unix timestamps, ISO 8601, relative time
- **Color Converters**: HEX, RGB, HSL, CMYK conversions
- **Byte Size Converters**: Human-readable byte size formatting
- **String Converters**: Case conversion, formatting utilities
- **Class Converters**: JavaScript class to named function conversion

## 🛠️ Development

### Prerequisites

- Node.js >= 18.0
- npm or yarn

### Installation

```bash
npm install
```

### Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

### Code Quality

This project uses several tools to maintain code quality:

- **ESLint**: Code linting with TypeScript, React, and security rules
- **Prettier**: Code formatting
- **Jest**: Testing with 80% coverage threshold
- **Husky**: Git hooks for pre-commit and pre-push checks
- **lint-staged**: Run linters on staged files only

### Git Hooks

- **pre-commit**: Runs ESLint and Prettier on staged files
- **pre-push**: Runs tests with coverage to ensure quality

### Import Aliases

The project supports clean imports using TypeScript path mapping:

```typescript
// Instead of relative imports
import { convertDataFormat } from '../../converters/data-format-converter';

// Use clean aliases
import { convertDataFormat } from '@/converters/data-format-converter';
import { useThrottle } from '@/hooks/useThrottle';
```

Available aliases:

- `@/*` → `src/*`
- `~/` → `src/`
- `@/components/*` → `src/components/*`
- `@/converters/*` → `src/converters/*`
- `@/hooks/*` → `src/hooks/*`
- `@/utils/*` → `src/utils/*`

## 🧪 Testing

Tests are organized in `__tests__` directories alongside source files:

```
src/
├── converters/
│   ├── data-format-converter.ts
│   └── __tests__/
│       └── data-format-converter.test.ts
```

Run tests with coverage:

```bash
npm run test:coverage
```

Coverage thresholds (80% minimum):

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## 🔒 Security

The project includes security-focused ESLint rules:

- `eslint-plugin-security`: Detects potential security vulnerabilities
- `eslint-plugin-sonarjs`: Code smell detection
- Prevents dangerous patterns like `eval()`, `innerHTML`, etc.

## 📦 Deployment

### Using SSH:

```bash
USE_SSH=true npm run deploy
```

### Without SSH:

```bash
GIT_USER=<Your GitHub username> npm run deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `npm run test:coverage && npm run lint`
5. Commit with pre-commit hooks enabled
6. Push and create a pull request

The CI pipeline will automatically:

- Run linting and formatting checks
- Execute tests with coverage
- Verify TypeScript compilation
- Upload coverage reports
