const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Add --card-bg to :root
css = css.replace(/:root\s*\{/, ':root {\n  --card-bg: #ffffff;');

// 2. Add --card-bg to [data-theme='dark'] and fix --white
css = css.replace(/\[data-theme='dark'\]\s*\{[^}]+\}/, (match) => {
  let newMatch = match.replace(/--white:\s*#1e293b;/, '--white: #ffffff;\n  --card-bg: #1e293b;');
  return newMatch;
});

// 3. Replace background: var(--white) with background: var(--card-bg)
css = css.replace(/background:\s*var\(--white\);/g, 'background: var(--card-bg);');

fs.writeFileSync(cssPath, css);
console.log('Fixed white colors');
