# Skill: Scaffold the Tech Dev Lab Base File

## Name
Scaffold the base tech-dev-lab.html file from scratch.

## Description
Trigger this skill when the user says: "scaffold the base file,"
"start from a clean file," or "rebuild the shell." It produces a working
single-file HTML app with the app shell, navigation, XP system, and empty
tool slots. No tool content yet — just the skeleton.

## Contents

### Step 1: Read context
Before writing any code, read:
- context/tech_stack.md
- context/design_system.md
- context/constraints.md
- context/instructional_principles.md

### Step 2: Produce the file
Output a single tech-dev-lab.html file with these sections, in order:

1. HTML head
   - meta charset utf-8
   - Google Fonts link for JetBrains Mono, Inter, Space Grotesk
   - React 18 UMD, ReactDOM 18 UMD, Babel Standalone via CDN
   - style block with keyframes only (scanline, fadeIn, shake, shieldPop)

2. Constants block inside script type="text/babel"
   - const C = { /* design system tokens from design_system.md */ }
   - const HEAD_FONT = "'Space Grotesk', sans-serif"
   - const MONO_FONT = "'JetBrains Mono', monospace"
   - const UI_FONT = "'Inter', system-ui, sans-serif"

3. Persistence layer
   - const STORAGE_KEY = "techDevLab.v2"
   - function load() and function save(state)
   - const DEFAULT_STATE = { xp: 0, level: 1, streak: 0, bestStreak: 0,
     muted: true, activeLayer: "electrical", fieldNotes: [],
     skillRadar: { electrical: 0, instrumentation: 0, plc: 0, programming: 0 } }

4. Game math
   - function levelOf(xp) — returns 1 through 6
   - function titleOf(level) — returns: Helper, Apprentice, Technician,
     Senior Tech, Lead Tech, Controls Engineer
   - function awardXP(state, n) — returns new state
   - function addFieldNote(state, entry) — returns new state

5. Shared UI components
   - Panel (bordered card)
   - H (section header, Space Grotesk uppercase)
   - Btn (primary button, cyan accent)
   - Chip (small tag)
   - Verdict (success/fail callout using lime/rose)
   - Helper (right sidebar Socratic helper)

6. Layer navigation
   - Left rail on desktop, bottom bar on mobile
   - Four layers: Electrical, Instrumentation, PLC, Programming
   - Each layer has 3 to 4 tool slots (empty placeholders)

7. Tool slot pattern
   - Each tool renders inside a Panel with a header (name + tool number)
   - Body is a placeholder: "Not yet built."

8. App shell
   - Top status strip: current layer, XP + level, skill radar mini-chart,
     mute toggle, reset button
   - Main content area renders the active layer's tool
   - Right sidebar: Helper (Socratic commentary)

9. Bootstrap
   - ReactDOM.createRoot(document.getElementById("root")).render(<App />)

### Step 3: Verify
- The file must open by double-clicking, no server required
- No console errors
- All four layers clickable
- XP counter can be incremented by a test button (leave in for now)

### Step 4: Write to output
- Save as output/tech-dev-lab.html
- Append to memory/build_log.md:
  - date heading "Scaffold"
  - what was produced
  - layers and tools built
  - what's next

### Step 5: Report
Return a one-paragraph summary: what was produced, file path, next step.
Do not include the file contents in your response — I will open it.
