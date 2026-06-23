const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace hardcoded hex colors with their variable equivalents (excluding within :root block)
// To be safe, we'll just replace everywhere because :root already has --white: #ffffff, not #fff.
// Wait, :root has --white: #ffffff. So #fff won't touch it.

css = css.replace(/#fff\b/g, 'var(--white)');
css = css.replace(/#fafafa\b/g, 'var(--room-bg)');
css = css.replace(/#f9fafb\b/g, 'var(--empty-bg)');
css = css.replace(/#f8fafc\b/g, 'var(--hover-bg)');

// Inject the new variables into :root
const rootRegex = /:root\s*\{([^}]+)\}/;
css = css.replace(rootRegex, (match, p1) => {
  return `:root {${p1}  --room-bg: #fafafa;\n  --empty-bg: #f9fafb;\n  --hover-bg: #f8fafc;\n}`;
});

// Inject the dark mode theme right after :root
const darkModeCSS = `
[data-theme='dark'] {
  --navy: #e2e8f0;
  --navy-light: #f8fafc;
  --navy-dark: #cbd5e1;
  --green: #4ade80;
  --green-bg: rgba(34, 197, 94, 0.15);
  --green-bdr: rgba(34, 197, 94, 0.3);
  --red: #f87171;
  --red-bg: rgba(239, 68, 68, 0.15);
  --red-bdr: rgba(239, 68, 68, 0.3);
  --amber: #fbbf24;
  --amber-bg: rgba(245, 158, 11, 0.15);
  --amber-bdr: rgba(245, 158, 11, 0.3);
  --gray-bg: #0f172a;
  --border: #334155;
  --text: #f1f5f9;
  --muted: #94a3b8;
  --white: #1e293b;
  --room-bg: #1e293b;
  --empty-bg: #0f172a;
  --hover-bg: #334155;
}
`;

css = css.replace(/(:root\s*\{[^}]+\})/, `$1\n${darkModeCSS}`);

fs.writeFileSync(cssPath, css);
console.log('CSS refactored successfully.');
