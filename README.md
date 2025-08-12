# XSS Safe Display

## Features

- 🛡️ **XSS Protection** - Comprehensive sanitization utilities
- 📝 **Safe Text Display** - HTML escaping for user content
- 🎨 **Controlled HTML Rendering** - Allowlist-based HTML sanitization
- 🔗 **URL Validation** - Malicious URL scheme prevention
- 🔧 **Object Sanitization** - Recursive object property cleaning
- 🔐 **Password-Aware Sanitization** - Smart handling of sensitive fields
- ⚡ **TypeScript Support** - Full type safety and IntelliSense
- ⚛️ **Framework Integration** - Ready-to-use with React, Vue, Angular

## Installation

```bash
npm install xss-safe-display
```

```bash
yarn add xss-safe-display
```

```bash
pnpm add xss-safe-display
```

## Quick Start

```typescript
import { safeDisplay, sanitizeRequestData, sanitizeString } from 'xss-safe-display';

// Safe text display
const userInput = "<script>alert('xss')</script>";
const safeText = safeDisplay.text(userInput);
console.log(safeText); // "&lt;script&gt;alert('xss')&lt;/script&gt;"

// Smart form data sanitization (preserves passwords)
const formData = {
  username: "<script>hack()</script>",
  password: "mySecret123!", // This will be preserved
  email: "user@test.com<img src=x onerror=alert()>"
};
const sanitized = sanitizeRequestData(formData);
// Sanitizes username and email, keeps password unchanged

// Direct string sanitization
const cleanString = sanitizeString("<img src=x onerror=alert()>");
```

## API Reference

### Core Sanitization Functions

```typescript
import { 
  sanitizeString,
  sanitizeHTML,
  sanitizeObject,
  escapeHTML,
  sanitizeUrl
} from 'xss-safe-display';
```

#### `sanitizeString(input: string): string`
Sanitizes string content to prevent XSS attacks.

```typescript
const malicious = '<script>alert("xss")</script>';
const safe = sanitizeString(malicious);
// Returns sanitized version without script tags
```

#### `sanitizeHTML(content: string, allowedTags?: string[]): string`
Safely sanitizes HTML content with configurable allowed tags.

```typescript
const htmlContent = '<p>Good</p><script>bad()</script><strong>Bold</strong>';
const safeHtml = sanitizeHTML(htmlContent, ['p', 'strong']);
// Returns: '<p>Good</p><strong>Bold</strong>'
```

#### `sanitizeObject(obj: any): any`
Recursively sanitizes object properties.

```typescript
const data = {
  name: '<script>alert("xss")</script>',
  nested: {
    content: '<img src=x onerror=alert()>'
  }
};
const clean = sanitizeObject(data);
// All string properties are sanitized recursively
```

#### `escapeHTML(text: string): string`
Escapes HTML special characters.

```typescript
const html = '<div>Hello & goodbye</div>';
const escaped = escapeHTML(html);
// Returns: '&lt;div&gt;Hello &amp; goodbye&lt;/div&gt;'
```

#### `sanitizeUrl(url: string): string`
Validates and sanitizes URLs to prevent malicious schemes.

```typescript
sanitizeUrl('https://example.com');        // ✅ Valid
sanitizeUrl('javascript:alert("xss")');    // ❌ Blocked
sanitizeUrl('data:text/html,<script>');    // ❌ Blocked
```

### safeDisplay Object

```typescript
import { safeDisplay } from 'xss-safe-display';
```

#### `safeDisplay.text(value: string | number | undefined | null): string`

Safely displays text content by escaping HTML characters.

```typescript
safeDisplay.text('<img src=x onerror=alert()>');  // Escaped HTML
safeDisplay.text(123);                             // "123"
safeDisplay.text(null);                            // ""
safeDisplay.text(undefined);                       // ""
```

#### `safeDisplay.html(content: string, allowedTags?: string[]): { __html: string }`

Sanitizes HTML and returns React-compatible object.

```typescript
const blogPost = `
  <h1>My Post</h1>
  <p>Safe content</p>
  <script>alert('malicious')</script>
`;

const safeHtml = safeDisplay.html(blogPost, ['h1', 'p', 'strong', 'em']);
// Returns: { __html: '<h1>My Post</h1><p>Safe content</p>' }

// Usage in React:
<div dangerouslySetInnerHTML={safeDisplay.html(content, ['p', 'br'])} />
```

#### `safeDisplay.url(url: string): string`

Validates and sanitizes URLs.

```typescript
safeDisplay.url('https://example.com');           // ✅ "https://example.com"
safeDisplay.url('/relative/path');                // ✅ "/relative/path"  
safeDisplay.url('javascript:alert("xss")');       // ❌ "" (blocked)
```

### Smart Sanitization Helpers

```typescript
import { 
  sanitizeRequestData,
  sanitizeValue,
  sanitizeValues,
  sanitizeFields
} from 'xss-safe-display';
```

#### `sanitizeRequestData<T>(data: T): T`

**Password-aware sanitization** - Sanitizes all fields except sensitive ones (passwords).

```typescript
interface UserForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  bio: string;
}

const formData: UserForm = {
  username: '<script>hack()</script>',
  email: 'user@test.com<img src=x>',
  password: 'mySecret123!',        // ✅ Preserved
  confirmPassword: 'mySecret123!', // ✅ Preserved  
  bio: 'Hello <script>xss()</script>'
};

const sanitized = sanitizeRequestData(formData);
// Sanitizes username, email, bio but keeps passwords unchanged
```

**Sensitive fields automatically preserved:**
- `password`
- `confirmPassword` 
- `passwordConfirm`
- `adminPassword`

#### `sanitizeValue(value: string): string`

Sanitizes a single string value.

```typescript
const searchQuery = '<script>alert("search hack")</script>';
const safeQuery = sanitizeValue(searchQuery);
// Use for individual inputs, search terms, etc.
```

#### `sanitizeValues(values: string[]): string[]`

Sanitizes an array of strings.

```typescript
const tags = ['javascript', '<script>bad()</script>', 'typescript'];
const safeTags = sanitizeValues(tags);
// Returns: ['javascript', 'sanitized_content', 'typescript']

// Perfect for: tags, categories, multiple selections
```

#### `sanitizeFields<T>(data: T, fields?: (keyof T)[]): T`

Selectively sanitizes specific fields or all string fields.

```typescript
const userData = {
  id: 123,
  username: 'john_doe',
  displayName: 'John <script>alert()</script>',
  email: 'john@test.com',
  bio: 'Hello <img src=x onerror=alert()>',
  isActive: true
};

// Option 1: Sanitize all string fields
const allSanitized = sanitizeFields(userData);

// Option 2: Sanitize only specific fields
const selective = sanitizeFields(userData, ['displayName', 'bio']);
// Only displayName and bio are sanitized, rest unchanged
```

## Framework Integration

### React

```tsx
import React from 'react';
import { safeDisplay, sanitizeRequestData } from 'xss-safe-display';

// Safe text component
function SafeText({ children }: { children: any }) {
  return <span>{safeDisplay.text(children)}</span>;
}

// Safe HTML component
function SafeHTML({ content, allowedTags = ['p', 'strong', 'em'] }: {
  content: string;
  allowedTags?: string[];
}) {
  return (
    <div dangerouslySetInnerHTML={safeDisplay.html(content, allowedTags)} />
  );
}

// Form with sanitization
function UserForm() {
  const handleSubmit = (formData: any) => {
    // Automatically preserves password fields
    const sanitized = sanitizeRequestData(formData);
    submitToAPI(sanitized);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      handleSubmit(Object.fromEntries(formData));
    }}>
      <input name="username" placeholder="Username" />
      <input name="password" type="password" placeholder="Password" />
      <textarea name="bio" placeholder="Bio" />
      <button type="submit">Register</button>
    </form>
  );
}
```

### Express.js Middleware

```typescript
import express from 'express';
import { sanitizeRequestData, sanitizeFields } from 'xss-safe-display';

const app = express();
app.use(express.json());

// Middleware: Sanitize all request bodies (password-aware)
const sanitizeMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeRequestData(req.body);
  }
  next();
};

// Middleware: Sanitize specific fields only
const sanitizeSpecificFields = (fields: string[]) => 
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeFields(req.body, fields);
    }
    next();
  };

// Routes
app.post('/api/register', sanitizeMiddleware, (req, res) => {
  // req.body is sanitized, passwords preserved
});

app.put('/api/profile', sanitizeSpecificFields(['bio', 'website']), (req, res) => {
  // Only bio and website are sanitized
});
```

### Vue.js

```vue
<template>
  <div>
    <!-- Safe text binding -->
    <p>{{ safeText(userInput) }}</p>
    
    <!-- Safe HTML rendering -->
    <div v-html="safeHtml(content, ['p', 'strong'])"></div>
  </div>
</template>

<script setup>
import { safeDisplay, sanitizeRequestData } from 'xss-safe-display';

const safeText = safeDisplay.text;
const safeHtml = (content, tags) => safeDisplay.html(content, tags).__html;

const submitForm = (formData) => {
  const sanitized = sanitizeRequestData(formData);
  // Submit sanitized data
};
</script>
```

## Common Use Cases

### 1. User Registration/Login Forms

```typescript
import { sanitizeRequestData } from 'xss-safe-display';

interface RegistrationForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

const handleRegistration = async (formData: RegistrationForm) => {
  // Sanitizes all fields EXCEPT password fields
  const sanitized = sanitizeRequestData(formData);
  
  // Passwords are preserved for proper hashing
  const hashedPassword = await hashPassword(sanitized.password);
  
  return await database.users.create({
    ...sanitized,
    password: hashedPassword
  });
};
```

### 2. Content Management

```typescript
import { sanitizeFields, safeDisplay } from 'xss-safe-display';

interface BlogPost {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  authorId: number;
}

const processBlogPost = (post: BlogPost) => {
  // Sanitize content fields but preserve authorId
  const sanitized = sanitizeFields(post, ['title', 'content', 'excerpt']);
  
  return {
    ...sanitized,
    tags: sanitizeValues(post.tags)
  };
};

// Display blog post safely
const BlogPostComponent = ({ post }) => (
  <article>
    <h1>{safeDisplay.text(post.title)}</h1>
    <div dangerouslySetInnerHTML={safeDisplay.html(post.content, [
      'p', 'h1', 'h2', 'h3', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote'
    ])} />
  </article>
);
```

### 3. Search Functionality

```typescript
import { sanitizeValue } from 'xss-safe-display';

const handleSearch = async (query: string, filters: string[]) => {
  // Sanitize search input
  const safeQuery = sanitizeValue(query);
  const safeFilters = sanitizeValues(filters);
  
  return await searchService.search(safeQuery, safeFilters);
};
```

### 4. API Response Sanitization

```typescript
import { sanitizeFields } from 'xss-safe-display';

// Sanitize data before sending to client
const getUserProfile = async (userId: string) => {
  const user = await database.users.findById(userId);
  
  // Sanitize user data (except sensitive fields like id, email)
  return sanitizeFields(user, ['displayName', 'bio', 'website']);
};

// Sanitize array of data
const getUsers = async () => {
  const users = await database.users.findAll();
  
  return users.map(user => 
    sanitizeFields(user, ['displayName', 'bio', 'website'])
  );
};
```

## Security Best Practices

### 1. Layer Your Defense

```typescript
// ✅ Good: Multiple layers of protection
const processUserInput = (input: string) => {
  // Layer 1: Input validation
  if (typeof input !== 'string' || input.length > 1000) {
    throw new Error('Invalid input');
  }
  
  // Layer 2: Sanitization
  const sanitized = sanitizeValue(input);
  
  // Layer 3: Output encoding (when displaying)
  return safeDisplay.text(sanitized);
};
```

### 2. Use Appropriate Sanitization Level

```typescript
// ✅ For forms with passwords
const formData = sanitizeRequestData(userData);

// ✅ For general content
const content = sanitizeFields(data, ['title', 'description']);

// ✅ For display only
const displayText = safeDisplay.text(userInput);
```

### 3. Allowlist HTML Tags

```typescript
// ✅ Good: Explicit allowlist
const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'];
const safeHtml = safeDisplay.html(content, ALLOWED_TAGS);

// ❌ Avoid: Too permissive
const unsafeHtml = safeDisplay.html(content); // Might allow dangerous tags
```

### 4. Validate After Sanitization

```typescript
const processComment = (comment: string) => {
  // Sanitize first
  const sanitized = sanitizeValue(comment);
  
  // Then validate the result
  if (sanitized.length === 0) {
    throw new Error('Comment cannot be empty after sanitization');
  }
  
  if (sanitized.length > 500) {
    throw new Error('Comment too long');
  }
  
  return sanitized;
};
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
// Core functions
declare function sanitizeString(input: string): string;
declare function sanitizeHTML(content: string, allowedTags?: string[]): string;
declare function sanitizeObject<T>(obj: T): T;
declare function escapeHTML(text: string): string;
declare function sanitizeUrl(url: string): string;

// Smart helpers
declare function sanitizeRequestData<T extends object>(data: T): T;
declare function sanitizeValue(value: string): string;
declare function sanitizeValues(values: string[]): string[];
declare function sanitizeFields<T extends Record<string, any>>(
  data: T, 
  fields?: (keyof T)[]
): T;

// Safe display utilities
interface SafeDisplay {
  text(value: string | number | undefined | null): string;
  html(content: string, allowedTags?: string[]): { __html: string };
  url(url: string): string;
}

declare const safeDisplay: SafeDisplay;
```

## Performance & Bundle Size

- **Lightweight**: ~20kb minified + gzipped
- **Tree-shakable**: Import only what you need
- **Zero external dependencies** except DOMPurify
- **Optimized**: Efficient sanitization algorithms
- **Memory efficient**: No memory leaks or excessive allocations

## Browser & Node.js Support

- ✅ **Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- ✅ **Node.js**: 12+
- ✅ **TypeScript**: 4.0+
- ✅ **Frameworks**: React, Vue, Angular, Svelte

## Dependencies

- **DOMPurify** `^3.2.6` - Industry-standard HTML sanitization
- **TypeScript** support built-in

## Migration Guide

### From Basic XSS Libraries

```typescript
// Before (typical XSS library)
import xss from 'xss';
const clean = xss(input);

// After (xss-safe-display)
import { sanitizeString } from 'xss-safe-display';
const clean = sanitizeString(input);
```

### From Manual Sanitization

```typescript
// Before (manual sanitization)
const sanitizeForm = (data) => {
  return Object.keys(data).reduce((acc, key) => {
    if (key === 'password') return { ...acc, [key]: data[key] };
    return { ...acc, [key]: escapeHtml(data[key]) };
  }, {});
};

// After (xss-safe-display)
import { sanitizeRequestData } from 'xss-safe-display';
const sanitized = sanitizeRequestData(data); // Handles passwords automatically
```

## Testing

```bash
npm test              # Run all tests
npm run test:coverage # Test coverage report
npm run test:security # Security-focused tests
```

## Contributing

1. Fork the repository: `https://github.com/MindaugasBaltrunas/safety-utils`
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## Changelog

### v0.0.1 (Latest)
- ✨ Initial release
- 🛡️ Core sanitization functions
- 🎨 safeDisplay utilities  
- 🔐 Password-aware sanitization
- ⚡ TypeScript support
- 📚 Framework integration examples

## License

ISC © [Mindaugas Baltrunas]

---

## Links

- 📦 **NPM**: https://www.npmjs.com/package/xss-safe-display
- 📚 **Repository**: https://github.com/MindaugasBaltrunas/safety-utils
- 🐛 **Issues**: https://github.com/MindaugasBaltrunas/safety-utils/issues
- 📖 **Documentation**: https://github.com/MindaugasBaltrunas/safety-utils/issues#readme

---

**⚠️ Security Notice**: This library provides sanitization utilities, but always implement defense-in-depth strategies. Use Content Security Policy (CSP), input validation, and proper authentication alongside these tools.