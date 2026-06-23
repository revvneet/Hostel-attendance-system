const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Add --heading to :root
css = css.replace(/:root\s*\{/, ':root {\n  --heading: #1a2744;');

// 2. Add --heading and fix --navy in [data-theme='dark']
css = css.replace(/\[data-theme='dark'\]\s*\{[^}]+\}/, (match) => {
  let newMatch = match.replace(/--navy:\s*#e2e8f0;/, '--navy: #1e293b;\n  --heading: #f1f5f9;');
  newMatch = newMatch.replace(/--navy-light:\s*#f8fafc;/, '--navy-light: #334155;');
  newMatch = newMatch.replace(/--navy-dark:\s*#cbd5e1;/, '--navy-dark: #0f172a;');
  return newMatch;
});

// 3. Replace `color: var(--navy);` with `color: var(--heading);`
css = css.replace(/color:\s*var\(--navy\);/g, 'color: var(--heading);');

fs.writeFileSync(cssPath, css);
console.log('Theme fix applied.');
