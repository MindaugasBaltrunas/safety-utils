import { xssGuard, sanitizeString, sanitizeHTML, sanitizeObject, escapeHTML, sanitizeUrl } from './src/xssGuard';

describe('xssGuard utilities', () => {
    describe('sanitizeString', () => {
        it('removes all HTML tags', () => {
            const result = sanitizeString('<script>alert("XSS")</script>Hello');
            expect(result).toBe('Hello');
        });

        it('returns value unchanged if no HTML', () => {
            const input = 'Safe text';
            expect(sanitizeString(input)).toBe(input);
        });

        it('handles empty string', () => {
            expect(sanitizeString('')).toBe('');
        });
    });

    describe('sanitizeHTML', () => {
        it('removes disallowed tags but keeps allowed ones', () => {
            const result = sanitizeHTML('<b>Bold</b><script>evil()</script>', ['b']);
            expect(result).toContain('<b>Bold</b>');
            expect(result).not.toContain('<script>');
        });

        it('keeps allowed attributes', () => {
            const html = '<span class="red">text</span>';
            const result = sanitizeHTML(html, ['span']);
            expect(result).toContain('class="red"');
        });

        it('returns empty string if input is falsy', () => {
            expect(sanitizeHTML('')).toBe('');
        });
    });

    describe('sanitizeObject', () => {
        it('sanitizes all string values in an object', () => {
            const obj = { a: '<b>ok</b>', b: '<script>bad()</script>' };
            const result = sanitizeObject(obj);
            expect(result.a).toBe('ok');
            expect(result.b).toBe('');
        });

        it('sanitizes nested objects', () => {
            const obj = { nested: { a: '<i>Italic</i>' } };
            const result = sanitizeObject(obj);
            expect(result.nested.a).toBe('Italic');
        });

        it('sanitizes arrays', () => {
            const arr = ['<b>bold</b>', '<script>bad()</script>'];
            const result = sanitizeObject(arr);

            expect(result[0]).toBe('bold');
            expect(result[1]).toBe('');
        });

        it('returns non-object values as is', () => {
            expect(sanitizeObject(123)).toBe(123);
        });
    });

    describe('escapeHTML', () => {
        it('escapes special HTML characters', () => {
            const text = `<div>"'&</div>`;
            expect(escapeHTML(text)).toBe('&lt;div&gt;&quot;&#039;&amp;&lt;/div&gt;');
        });

        it('returns input if no special chars', () => {
            expect(escapeHTML('hello')).toBe('hello');
        });

        it('handles empty string', () => {
            expect(escapeHTML('')).toBe('');
        });
    });

    describe('sanitizeUrl', () => {
        it('returns # for invalid URL', () => {
            expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
        });

        it('adds https:// if missing scheme', () => {
            expect(sanitizeUrl('example.com')).toBe('https://example.com');
        });

        it('keeps http/https/mailto URLs', () => {
            expect(sanitizeUrl('https://safe.com')).toBe('https://safe.com');
            expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
        });

        it('returns # for empty input', () => {
            expect(sanitizeUrl('')).toBe('#');
        });
    });

    describe('xssGuard object', () => {
        it('exposes expected functions', () => {
            expect(typeof xssGuard.sanitizeString).toBe('function');
            expect(typeof xssGuard.sanitizeHTML).toBe('function');
            expect(typeof xssGuard.sanitizeObject).toBe('function');
            expect(typeof xssGuard.escapeHTML).toBe('function');
            expect(typeof xssGuard.sanitizeUrl).toBe('function');
        });
    });
});
