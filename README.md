# XSS Safe Display

## Features

- 🛡️ **XSS Protection** - Comprehensive sanitization utilities
- 📝 **Safe Text Display** - HTML escaping for user content
- 🎨 **Controlled HTML Rendering** - Allowlist-based HTML sanitization
- 🔗 **URL Validation** - Malicious URL scheme prevention
- 🔧 **Object Sanitization** - Recursive object property cleaning
- ⚡ **TypeScript Support** - Full type safety and IntelliSense
- ⚛️ **React Integration** - Ready-to-use with React components

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
import { safeDisplay, sanitizeHTML, escapeHTML } from 'xss-safe-display';

// Safe text display
const userInput = "<script>alert('xss')</script>";
const safeText = safeDisplay.text(userInput);
console.log(safeText); // "&lt;script&gt;alert('xss')&lt;/script&gt;"

// Safe HTML with allowed tags
const htmlContent = "<p>Hello</p><script>alert('bad')</script>";
const safeHtml = safeDisplay.html(htmlContent, ['p', 'strong']);
// Returns: { __html: "<p>Hello</p>" }

// URL sanitization
const safeUrl = safeDisplay.url("javascript:alert('xss')");
console.log(safeUrl); // Returns safe fallback or empty string
```

## API Reference

### Named Exports

```typescript
import { 
  sanitizeString,
  sanitizeHTML,
  sanitizeObject,
  escapeHTML,
  sanitizeUrl,
  safeDisplay 
} from 'xss-safe-display';
```

### Core Sanitization Functions

#### `sanitizeString(input: string): string`
Sanitizes string content to prevent XSS attacks.

#### `sanitizeHTML(content: string, allowedTags?: string[]): string`
Safely sanitizes HTML content with configurable allowed tags.

#### `sanitizeObject(obj: any): any`
Recursively sanitizes object properties.

#### `escapeHTML(text: string): string`
Escapes HTML special characters.

#### `sanitizeUrl(url: string): string`
Validates and sanitizes URLs to prevent malicious schemes.

### safeDisplay Object

#### `safeDisplay.text(value: string | number | undefined | null): string`

Safely displays text content by escaping HTML characters.

```typescript
const userInput = "<img src=x onerror=alert('xss')>";
const safe = safeDisplay.text(userInput);
// Returns: "&lt;img src=x onerror=alert('xss')&gt;"

// Handles all data types safely
safeDisplay.text(null);      // ""
safeDisplay.text(undefined); // ""
safeDisplay.text(123);       // "123"
```

#### `safeDisplay.html(content: string, allowedTags?: string[]): { __html: string }`

Sanitizes HTML and returns React-compatible object.

```typescript
const blogPost = `
  <h1>My Post</h1>
  <p>Safe content</p>
  <script>alert('malicious')</script>
  <img src="x" onerror="alert('bad')">
`;

const safeHtml = safeDisplay.html(blogPost, ['h1', 'p', 'strong', 'em']);
// Only allowed tags are preserved, scripts are removed
```

#### `safeDisplay.url(url: string): string`

Validates and sanitizes URLs.

```typescript
safeDisplay.url("https://example.com");           // "https://example.com"
safeDisplay.url("http://example.com");            // "http://example.com"
safeDisplay.url("/relative/path");                // "/relative/path"
safeDisplay.url("javascript:alert('xss')");       // "" (blocked)
safeDisplay.url("data:text/html,<script>...");    // "" (blocked)
```

## Framework Integration

### React

```tsx
import React from 'react';
import { safeDisplay } from 'xss-safe-display';

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
    <div 
      dangerouslySetInnerHTML={safeDisplay.html(content, allowedTags)} 
    />
  );
}

// Safe link component
function SafeLink({ href, children }: { 
  href: string; 
  children: React.ReactNode; 
}) {
  const safeHref = safeDisplay.url(href);
  
  return (
    <a href={safeHref} rel="noopener noreferrer">
      {safeDisplay.text(children)}
    </a>
  );
}
```

### Vue.js

```vue
<template>
  <div>
    <!-- Safe text binding -->
    <p>{{ safeText(userInput) }}</p>
    
    <!-- Safe HTML rendering -->
    <div v-html="safeHtml(content, ['p', 'strong'])"></div>
    
    <!-- Safe link -->
    <a :href="safeUrl(link)">{{ safeText(linkText) }}</a>
  </div>
</template>

<script setup>
import { safeDisplay } from 'xss-safe-display';

const safeText = safeDisplay.text;
const safeHtml = (content, tags) => safeDisplay.html(content, tags).__html;
const safeUrl = safeDisplay.url;
</script>
```

### Angular

```typescript
import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { safeDisplay } from 'xss-safe-display';

@Component({
  selector: 'app-safe-content',
  template: `
    <div [innerHTML]="safeHtmlContent"></div>
    <p>{{ safeTextContent }}</p>
    <a [href]="safeLinkUrl">Safe Link</a>
  `
})
export class SafeContentComponent {
  safeTextContent: string;
  safeHtmlContent: SafeHtml;
  safeLinkUrl: string;

  constructor(private sanitizer: DomSanitizer) {
    // Note: Angular's DomSanitizer provides additional security layer
    this.safeTextContent = safeDisplay.text(userInput);
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(
      safeDisplay.html(htmlContent, ['p', 'strong']).__html
    );
    this.safeLinkUrl = safeDisplay.url(userUrl);
  }
}
```

## Common Use Cases

### User-Generated Content

```typescript
import { safeDisplay, sanitizeObject } from 'xss-safe-display';

// Blog comments
function displayComment(comment: { author: string; content: string; avatar?: string }) {
  const safeComment = sanitizeObject(comment);
  
  return {
    author: safeDisplay.text(safeComment.author),
    content: safeDisplay.html(safeComment.content, ['p', 'br', 'strong', 'em']),
    avatar: safeComment.avatar ? safeDisplay.url(safeComment.avatar) : null
  };
}

// Form data processing
function processContactForm(formData: Record<string, any>) {
  const sanitized = sanitizeObject(formData);
  
  return {
    name: safeDisplay.text(sanitized.name),
    email: safeDisplay.text(sanitized.email),
    message: safeDisplay.text(sanitized.message),
    website: sanitized.website ? safeDisplay.url(sanitized.website) : ''
  };
}
```

### Content Management Systems

```typescript
// Rich text editor content
function renderArticle(article: { title: string; content: string; excerpt: string }) {
  const allowedTags = [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'u', 'ol', 'ul', 'li',
    'blockquote', 'a', 'br', 'hr'
  ];
  
  return {
    title: safeDisplay.text(article.title),
    content: safeDisplay.html(article.content, allowedTags),
    excerpt: safeDisplay.text(article.excerpt)
  };
}
```

### API Response Sanitization

```typescript
import { sanitizeObject } from 'xss-safe-display';

// Sanitize API responses
async function fetchUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  const userData = await response.json();
  
  // Sanitize all string fields in the response
  return sanitizeObject(userData);
}
```

## Security Best Practices

### 1. Defense in Depth
Always sanitize at multiple layers:

```typescript
// At input (form submission)
const sanitizedInput = sanitizeObject(formData);

// At storage (before database)
const cleanData = sanitizeString(sanitizedInput.content);

// At display (before rendering)
const displayContent = safeDisplay.text(cleanData);
```

### 2. Allowlist Approach
Always use allowlists for HTML tags:

```typescript
// ✅ Good - explicit allowlist
const allowedTags = ['p', 'strong', 'em', 'ul', 'ol', 'li'];
safeDisplay.html(content, allowedTags);

// ❌ Avoid - no restrictions
safeDisplay.html(content); // May allow dangerous tags
```

### 3. Content Security Policy (CSP)
Combine with CSP headers for additional protection:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self';">
```

### 4. Input Validation
Validate data types and formats:

```typescript
function validateAndSanitize(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('Invalid input type');
  }
  
  if (input.length > 10000) {
    throw new Error('Input too long');
  }
  
  return safeDisplay.text(input);
}
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
interface SafeDisplay {
  text(value: string | number | undefined | null): string;
  html(content: string, allowedTags?: string[]): { __html: string };
  url(url: string): string;
}

declare function sanitizeString(input: string): string;
declare function sanitizeHTML(content: string, allowedTags?: string[]): string;
declare function sanitizeObject<T>(obj: T): T;
declare function escapeHTML(text: string): string;
declare function sanitizeUrl(url: string): string;
declare const safeDisplay: SafeDisplay;
```

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Node.js 12+

## Performance

- Lightweight bundle size (~15kb minified)
- Tree-shakable exports
- Zero external dependencies
- Optimized for frequent sanitization operations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

```bash
npm test
npm run test:coverage
npm run test:security
```

## License

MIT © [Your Name]

## Changelog

### v1.0.0
- Initial release
- Core sanitization functions
- safeDisplay utilities
- TypeScript support
- React integration examples

---

## Support

- 📚 [Documentation](https://github.com/yourusername/xss-safe-display#readme)
- 🐛 [Issue Tracker](https://github.com/yourusername/xss-safe-display/issues)
- 💬 [Discussions](https://github.com/yourusername/xss-safe-display/discussions)
- 📧 [Email Support](mailto:support@yourpackage.com)