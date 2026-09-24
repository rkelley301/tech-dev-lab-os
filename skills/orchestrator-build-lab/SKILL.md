# Skill: Build the Full Tech Dev Lab

## Name
Orchestrate the complete build of Tech Dev Lab.

## Description
Trigger when the user says: "build the full lab," "run the whole build,"
or "produce the complete file." Runs every build skill in sequence.

## Contents

### Step 1: Pre-flight
Read memory/build_log.md to see what's already done. Skip any step
whose output already exists in output/.

If output/tech-dev-lab.html does not exist:
  -> Run skills/01-scaffold/SKILL.md

If output/content-library.json does not exist:
  -> Run skills/02-extract-content/SKILL.md

### Step 2: Build the tools (in order)
For each tool, run skills/03-build-tool/SKILL.md with the tool spec:

1. Tool 1.1 — Wire It Live (24 VDC Start/Stop)
2. Tool 1.2 — Sourcing or Sinking?
3. Tool 1.3 — Contact Logic Puzzle
4. Tool 1.4 — Trap Spotter
5. Tool 2.1 — Wire Count Detective
6. Tool 2.2 — Scaling Bench
7. Tool 2.3 — Calibration Record Builder
8. Tool 2.4 — Split-Half Isolator
9. Tool 3.1 — I/O Map Inspector
10. Tool 3.2 — Permissive Detective
11. Tool 3.3 — Timer Trace
12. Tool 3.4 — Symptom → First Move
13. Tool 4.1 — Rung Editor
14. Tool 4.2 — HMI Tag Bind
15. Tool 4.3 — Change Control Gate

### Step 3: Add cross-cutting features
- Run skills/04-diagnostic-ribbon/SKILL.md
- Run skills/05-field-notes-drawer/SKILL.md
- Run skills/10-port-calculators/SKILL.md

### Step 4: Add Layer 5 (Drill)
- Run skills/08-drill-engine/SKILL.md

### Step 5: Add the Roadmap
- Run skills/09-roadmap-tab/SKILL.md

### Step 6: Final verification
- File opens without errors
- All tools render
- XP system functional
- localStorage persists across reload
- Field Notes drawer populates
- Every card cites its source

### Step 7: Write final build log
Append to memory/build_log.md:
  ## [date] — Full build complete
  - Tools built: 15
  - Layers: 5
  - Total XP available: ~2000
  - Deliverable: output/tech-dev-lab.html
  - Known issues: [list]

### Step 8: Report
Return a summary: what was built, what to test, what's next.
