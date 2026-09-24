# Skill: Build One Tool

## Name
Build a single Tech Dev Lab tool into output/tech-dev-lab.html.

## Description
Trigger when the user says "build tool X.Y", or when the orchestrator
runs Step 2 with a tool spec (layer, tool number, tool name, content).
Replaces that tool's "Not yet built." slot with a working tool. One tool
per run; every other slot is left as it is.

## Contents

### Step 1: Read context
Before writing any code, read:
- context/instructional_principles.md
- context/design_system.md
- context/tech_stack.md
- context/constraints.md
- memory/build_log.md (what already exists)

### Step 2: Load the content
- Read output/content-library.json. Use only items the tool spec names
  (for example: symptoms that have options).
- Never add an item, value, or explanation that is not in the library.
  If the tool needs content the library does not have, stop and ask.
- Embed the content in the HTML as a generated constant (single-file
  rule). Mark it "Generated from output/content-library.json".

### Step 3: Build the tool
The tool is one React component in the TOOL COMPONENTS section,
registered in the TOOLS map by tool number with a panel source line.
It must honor every instructional principle:
1. Decision before definition: show the symptom or situation and the
   choices first. Explanations, patterns, and formulas appear only
   after the user acts.
2. Split-half spine: show the diagnostic chain (Process, Sensor,
   Transmitter, Wiring, Card, Controller, Display) and what the
   decision cleared.
3. Productive failure: a wrong choice shows its consequence (from the
   option's cost tag and reason), then the user rewinds and retries.
4. Evidence trail: log every decision to a visible log in the tool and
   to Field Notes (addFieldNote).
5. Spaced recall: a missed pattern returns a few cards later in a
   different item.
6. Every number earned: no values that are not in the content.
7. Cite the source: every card shows its source; every revealed answer
   shows its citations. Constructed fields (tagDerived) are labeled.

Design and accessibility (design_system.md, tech_stack.md):
- Palette tokens from C only; Space Grotesk headers, Inter body,
  JetBrains Mono for tags, values, and citations.
- Number keys choose options, Enter advances; ARIA labels on every
  control; live region for results; 44px touch targets; single column
  below 900px; respect prefers-reduced-motion.
- Tool state persists under a dotted sub-key of the main storage key
  (techDevLab.v3.<toolName>). Reset clears it.
- XP and streak go through the app's onResult callback.

### Step 4: Verify
- Open the file headless from disk (no server): no console errors.
- Drive the tool: correct choice, wrong choice + retry, Enter to advance,
  number keys, reload persists, reset clears, phone width has no
  horizontal overflow.
- Every card in the embedded content renders with a citation.

### Step 5: Show before saving
Build the draft in the scratchpad. Show the user a 20-line sample from
the top of the new tool component, and wait for approval before writing
output/tech-dev-lab.html.

### Step 6: Write and log
- Save as output/tech-dev-lab.html.
- Append to memory/build_log.md under a dated heading: tool built,
  content count, what was verified, what's next.

### Step 7: Report
Summarize what was produced, what to test by hand, and what's next.
