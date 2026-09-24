# Technical Stack

## Runtime
- Single HTML file, opens directly in a browser
- No build step, no bundler, no npm install
- Must work offline after first load

## Libraries (loaded via CDN)
- React 18 UMD build
- ReactDOM 18 UMD build
- Babel Standalone (in-browser JSX transform)
- Google Fonts: JetBrains Mono, Inter, Space Grotesk

## State
- localStorage only. Key: techDevLab.v2
- Per-tool sub-keys use dotted notation: techDevLab.v2.symptomFirstMove
- No backend, no auth, no cloud sync

## Styling
- CSS-in-JS (inline style objects)
- No Tailwind, no CSS files, no styled-components
- Keyframes defined once in a style block at the top of the file
- Respect prefers-reduced-motion

## File structure inside the HTML
- HTML head: meta, fonts, CDN scripts, style block with keyframes
- Script block, in order:
  1. CONSTANTS & DATA
  2. SHARED UI COMPONENTS
  3. TOOL COMPONENTS
  4. APP SHELL
  5. RENDER

## Accessibility
- Full keyboard navigation (number keys for options, Enter to advance)
- ARIA labels on every interactive element
- Graceful single-column layout below 900px width
- Touch targets at least 44px on mobile
