# Friendly Toolbox

A fast, modern developer utility hub built with React 19 and functional programming principles.

## Features

- **30+ Developer Tools** - JSON formatter, Base64 encoder, hash generator, regex tester, and more
- **Instant Results** - Auto-transform as you type with 300ms debounce
- **Dark Mode** - System preference detection with manual toggle
- **Keyboard Shortcuts** - Quick navigation with `Cmd+K` command palette
- **Pin Favorites** - Keep your most-used tools at the top
- **URL Routing** - Direct links to any tool
- **Offline Ready** - Works without internet connection

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Functional | Ramda.js |
| Icons | Lucide React |

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production (includes SEO pre-rendering)
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## SEO

The build process automatically pre-renders all 28 tool pages for SEO. Each page gets:
- Unique `<title>` tag
- Unique `<meta description>`
- Open Graph tags for social sharing
- Canonical URLs

This ensures search engines and social media crawlers see the correct metadata for each tool.

## Deploy to GitHub Pages

### 1. Create GitHub Repository

```bash
gh repo create friendly --public --source=. --remote=origin
```

### 2. Set Firebase Config Secret

```bash
gh secret set FIREBASE_CONFIG --body '{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT.firebaseapp.com",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_PROJECT.appspot.com",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID"
}'
```

### 3. Enable GitHub Pages

Go to GitHub repo → **Settings** → **Pages** → Source: **GitHub Actions**

### 4. Push to Deploy

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

The site will auto-deploy on every push to `main`. Check **Actions** tab for build status.

### Local Development with Firebase

Create `firebase.config.json` in project root (gitignored):

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT.firebaseapp.com",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_PROJECT.appspot.com",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID"
}
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. **Authentication** → Sign-in method → Enable **Google**
4. **Firestore Database** → Create database → Start in test mode
5. **Project Settings** → Your apps → Add web app → Copy config

## Available Tools

### Text & String
- Case Converter (camelCase, snake_case, PascalCase, etc.)
- Text Diff (side-by-side comparison)
- UUID Generator
- Lorem Ipsum Generator
- Slug Generator
- Line Tools (sort, dedupe, reverse)
- Regex Tester

### Formatters
- JSON Formatter/Minifier
- SQL Formatter
- YAML to JSON / JSON to YAML
- Markdown Preview

### Encoding
- Base64 Encoder/Decoder
- URL Encoder/Decoder
- HTML Entity Encoder/Decoder

### Crypto & Hash
- Hash Generator (MD5, SHA-1, SHA-256, SHA-512)
- Password Generator
- HMAC Generator

### Development
- JWT Decoder
- URL Parser
- Cron Parser
- Unix Timestamp Converter
- Color Converter (Hex/RGB/HSL)
- Number Base Converter

## Adding New Tools

Create a plugin in `src/plugins/{category}/`:

```typescript
import { IconName } from 'lucide-react';
import type { ToolPlugin } from '@/types/plugin';
import { success, failure, getStringInput } from '@/utils';

export const myTool: ToolPlugin = {
  id: 'my-tool',
  label: 'My Tool',
  description: 'Does something useful',
  category: 'text',
  icon: <IconName className="h-4 w-4" />,
  keywords: ['search', 'terms'],
  inputs: [
    {
      id: 'input',
      label: 'Input',
      type: 'textarea',
      required: true,
    },
  ],
  transformer: (inputs) => {
    const input = getStringInput(inputs, 'input');
    if (!input) return failure('Input required');

    const result = input.toUpperCase(); // Your logic here
    return success(result);
  },
};
```

Register in `src/plugins/index.ts`:

```typescript
import { myTool } from './text/my-tool';
registry.register(myTool);
```

## License

MIT
