## 2026-09-24 — OS scaffold
- Created CLAUDE.md.
- Created folders: context/, sources/, skills/, output/, memory/.
- Wrote six context files: project_brief, tech_stack, design_system, instructional_principles, source_materials, constraints.
- sources/ is empty; the source files listed in context/source_materials.md still need to be copied in.

## 2026-09-24 — Sources copied
- Copied 8 of 10 source files into sources/ from Desktop and Desktop/active.
- Field Learning Plan copied from "FIELD LEARNING PLAN_ Process Plant Instrumentation & Signal Flow Mastery.pdf" and renamed to Field Learning Plan.pdf.
- Missing, not found anywhere under the user folder: "You are a senior front-end engineer and.txt", "What to add (in priority order).txt".

## 2026-09-24 — Orchestrator skill
- Created skills/orchestrator-build-lab/SKILL.md (build sequence: scaffold, extract content, 15 tools, cross-cutting features, drill, roadmap, verify, log).
- Sub-skills it calls (01-scaffold, 02-extract-content, 03-build-tool, 04, 05, 08, 09, 10) not yet created — planned for next session.

## 2026-09-24 — Renamed course design PDF
- Renamed sources/"course design .pdf" to sources/course-design.pdf and updated both references in context/source_materials.md.

## 2026-09-24 — Scaffold skill
- Created skills/01-scaffold/SKILL.md (defines how to build the base shell: head, tokens, persistence, XP math, shared UI, layer nav, empty tool slots, verify, log).
- Skill not yet run; output/tech-dev-lab.html does not exist yet.

## 2026-09-24 — Scaffold
- Ran skills/01-scaffold/SKILL.md. Produced output/tech-dev-lab.html (single file, React 18.3.1 UMD + Babel Standalone 7.24.7 from unpkg, Google Fonts).
- Built: design tokens, persistence (techDevLab.v2, validated on load), game math (levelOf, titleOf, awardXP, addFieldNote), shared UI (Panel, H, Btn, Chip, Verdict, Helper, Radar, Scanline), layer nav (left rail desktop / bottom bar under 900px), status strip (layer, XP + level with scanline, skill radar, sound toggle, two-step reset), Socratic Helper sidebar.
- Layers: 4 (Electrical, Instrumentation, PLC, Programming). Tool slots: 15 placeholders (1.1–1.4, 2.1–2.4, 3.1–3.4, 4.1–4.3), each showing "Not yet built." with source "pending".
- Works (verified headless in Edge): renders from file://, all 4 layers and tool tabs switch, test button adds XP, XP/layer/sound persist across reload, reset clears state, mobile layout has fixed bottom bar, no horizontal overflow, all buttons >= 44px. No console errors (only Babel's in-browser-transform warning).
- Decisions to confirm: level thresholds [0, 150, 400, 800, 1300, 1900] XP were my choice (not from sources). Active tool per layer is not persisted.
- Broken / open: nothing known. Test XP button is intentionally left in (DEV ONLY).
- Next: skills/02-extract-content/SKILL.md (not yet written).
- 2026-09-24: Bumped output/tech-dev-lab.html localStorage key techDevLab.v2 -> techDevLab.v3 so it can't overwrite the sources/ reference build's v2 save; verified XP persists across reload and the v2 save is untouched.

## 2026-09-24 — Extract-content skill
- Created skills/02-extract-content/SKILL.md (symptoms, drills, traps, NAMUR bands -> output/content-library.json). Not yet run.

## 2026-09-24 — Content extraction
- Symptoms: 77 (IC_Fundamentals_Drill_Input_Library.pdf p.13–15). Symptom text only: tag, service and options left empty because the source has none. 10 PID/process-control symptoms use category "PID/Process Control" (not in the skill's enum).
- Drill templates: 18 (I&C Fundamentals Drill Pack.pdf p.3–9). drill-018 has no "Why it works" in the source (null). Unnumbered "Universal Master Template" (p.2) not included.
- Beginner traps: 8 (Field Learning Plan.pdf p.10)
- NAMUR bands: 8 (Field Troubleshooting Template Pack.pdf p.4). Added a "reading" field with the source's exact wording; the non-band row "Correct at device, wrong at controller" not included.
- All 111 items checked word-for-word against source text; 0 mismatches. Every item cites file + page.
- Source files read: IC_Fundamentals_Drill_Input_Library.pdf, I&C Fundamentals Drill Pack.pdf, Field Learning Plan.pdf, Field Troubleshooting Template Pack.pdf, Field Troubleshooting Calculators.xlsx, course-design.pdf, 80_20 Core Knowledge Domains.pdf, tech-dev-lab.html
- Files that could not be read: "You are a senior front-end engineer and.txt", "What to add (in priority order).txt" (not present in sources/)
- Open: symptom options need a user decision; NAMUR thresholds differ between Template Pack p.4, course-design.pdf p.2 and the Calculators mA Converter sheet.

## 2026-09-24 — Content library: sourced options
- Symptoms with sourced options: 32 (27 from Form 7 checklists, Template Pack p.9–10; 9 from course-design.pdf p.2 filmed faults 1, 2, 3, 6, 7, with wrong options from Form 7 failure modes). All option text verbatim-verified; every option has derivedFrom (file, page, step/fault).
- Symptoms flagged needsReview: 45 (38 with no matching pattern; 7 matched "Reading is slow or sticky" / "Valve hunts or cycles", which have no Failure mode line).
- Rule adaptation: "wrong #3 = step 6 or 7" had no distinct step for HIGH, STABLE and NOISY checklists; used the next-latest unused step (15 symptoms). "Last step" = last non-failure-mode step.
- cut is [] on 5 course-design matches (sig-012, 013, 014, 035, 050): the lesson names a cause, not a measurement point.
- Categories updated: added "PID/Process Control" (9th) to skills/02-extract-content/SKILL.md and context/source_materials.md.
- NAMUR bands updated with alternativeSources (course-design.pdf p.2, Calculators mA Converter) + rationale from the Template Pack p.4 warning.
- drill-018: whyItWorksNote added.

## 2026-09-24 — Content library: tags + match priority
- All 77 symptoms now have a constructed ISA-5.1 tag + service, flagged "tagDerived": true (77 unique tags; letters from the Input Library p.12–13 practice table, plus HS and FY).
- Re-matched with priority: heading phrase > failure mode > measurement type > needsReview with candidateCategories. Matched symptoms carry matchBasis.
- Symptoms with sourced options: 37 (was 32; added sig-011, 020, 047, 071, 075). needsReview: 40 (7 incomplete pattern, 17 with candidateCategories, 16 no candidates).
- Questionable by rule: sig-047 (RTD reads open) and sig-020 (solenoid energized) each have the most relevant checklist step as a wrong option.
- 2026-09-24: Added tag/service (tagDerived), matching priority, option-building and cut rules to skills/02-extract-content/SKILL.md so future extractions reproduce the current library.

## 2026-09-24 — Content library: go-aheads + overrides
- Symptoms with options: 52 (was 37)
- needsReview: 25 — 17 ambiguous/weak with candidateCategories (009, 020, 029, 032, 033, 052, 054, 057, 061, 063–067, 069, 076, 077); 8 with no candidate (036, 037, 044, 046, 059, 072, 073, 074)
- Go-aheads applied: (1) slow/sticky + valve hunts (7) use the noisy damping failure mode; hunts also cite the course-design PIC-510 capstone on the PID-tuning option. (2) Discrete/PLC (9) use Field Learning Plan 30-second sequence step 1 as correct, traps 5 and 6 moves + sequence step 5 as wrong.
- Manual overrides applied: sig-047 correct = open TC/RTD lead check, cut [Process, Sensor]; sig-020 -> needsReview (candidate: Discrete); sig-014 -> Form 7 noisy checklist (heading match beats course-design).
- derivedFrom is now a list of citations. Tags: HS-207 -> FSL-207, FY-711 -> FV-711 so every tag uses the Input Library p.12–13 letter codes (checked).
- Skill file updated: new 5-rule match priority, tagDerived rule, the new answer sources, option rules for slow/hunts/discrete. context/source_materials.md lists the new answer-source pages.

## 2026-09-24 — Tool 3.4 built: Symptom -> First Move
- Symptoms included: 52 (of the 77 total; the rest are needsReview)
- XP: 15/5/0 first-pass only (a persisted "played" set makes replays award 0; Reset progress clears it)
- Radar: 0.4 per first-pass correct
- File: output/tech-dev-lab.html
- Layer: PLC (Tool 3.4 of 4)
- Created skills/03-build-tool/SKILL.md (already referenced by the orchestrator).
- Verified headless from disk: all 52 cards render with citations; wrong pick shows consequence + retry and schedules pattern recall; keys 1-4 / Enter; reload persists; reset clears tool state; phone width OK; no console errors.
- Not done: COST_CONSEQUENCE header comment (the pasted comment text was not included in the request).
- Next: build tool 1.4 Trap Spotter using the same pattern

## 2026-09-24 — Tool 1.4 built: Trap Spotter
- Traps included: 8 (all, Field Learning Plan.pdf p.10)
- Card: looksLike = scenario; 4 choices = the trap + 3 other traps, shuffled; fix = explanation after answering. A wrong pick shows the picked trap's own looksLike (no invented consequence text).
- No diagnostic chain: traps carry no cut data.
- Recall: a first-pick miss returns the same trap 3 cards later.
- XP: 15/5/0 first-pass only (same "played" set rule as 3.4)
- Radar: 0.4 electrical per first-pass correct
- Refactor: 3.4's log table is now a shared DecisionLog used by both tools.
- Verified headless from disk: 8 cards render with citations and 4 unique choices; wrong + retry; keys 1-4 / Enter; reload persists; replay 0 XP; phone width OK; no console errors. Tool 3.4 regression passed (52 cards, 770 XP, PLC radar 20.4).
- File: output/tech-dev-lab.html
- Layer: Electrical (Tool 1.4 of 4)
- Next: user to choose the next tool.

## 2026-09-24 — COST_CONSEQUENCE header comment
- Added the user's COST_CONSEQUENCE header comment, verbatim, as the first lines of the app script in output/tech-dev-lab.html (the literal file top would render as page text before <!DOCTYPE>).
- XP [15, 5, 0, 0] first-pass only and radar 0.4 were already in place (confirmed). Tools 1.4 and 3.4 retested: no console errors.

## 2026-09-24 — Storage key fixes
- Trap Spotter now saves under techDevLab.v2.trapSpotter (user request). Listed in EXTRA_TOOL_KEYS so Reset clears it; progress saved under the earlier techDevLab.v3.trapSpotter key is read once so it carries over.
- Correction: the sources/ reference build uses techDevLab.v1, not v2 (earlier entries and the file's storage comment said v2). Storage comment rewritten. v3 app key unchanged.
- Retested: 1.4 (8 cards, 110 XP, reset clears the v2 key) and 3.4 (52 cards, 770 XP); no console errors.

## 2026-09-24 — Tool 1.1 blocked; content library: splitHalf
- Tool 1.1 (Wire It Live) not built: no source gives the start/stop seal-in circuit (only named as an exercise, Field Learning Plan p.12 / 80_20 p.8). User chose to build 2.4 instead.
- Added "splitHalf" to output/content-library.json (Template Pack p.3 heading, rule, 5 measurement points, columns, footer; Calculators Split-Half Log chain, "Measure in the middle" line, Flag formula thresholds, LT-301 example). All text verified verbatim; other sections unchanged. Skill 02 has a new Step 6b.

## 2026-09-24 — Tool 2.4 built: Split-Half Isolator
- Simulator: hidden fault in one of 7 chain links; pick a measurement point; reading = agrees / disagrees with the display (no simulated values); each cut flagged with the Split-Half Log formula; round ends when the points can't split what is left.
- Constructed (labeled on screen): point positions on the chain (Controller input after Card, Field terminal after Wiring, Transmitter terminals after Transmitter, Sensor/process connection after Process) and the agree/disagree model. Junction box left out (inside the Wiring link).
- 5 isolatable fault groups: Process, Sensor/Transmitter, Wiring, Card, Controller/Display.
- XP: 15 / 5 / 0 by weak-or-wasted cuts in the round, first pass per fault group only (max 75). Radar: 0.4 instrumentation per perfect first pass.
- Evidence: per-round split-half log (step, point, reading, links before -> after, flag); bracketing readings shown at the end; Field Note per round. Worked LT-301 example shown after each round.
- Shared UI: OptionButton gained a "used" state; SignalChain caption lead is per tool.
- Verified headless from disk: weak cut flagged, 30 optimal rounds all Good cut / Isolated, XP 65 over 5 groups, reload mid-round, keys, reset, phone width; 1.4 and 3.4 regressions pass; no console errors.
- File: output/tech-dev-lab.html
- Layer: Instrumentation (Tool 2.4 of 4)
- Next: user to choose. 1.1 still needs circuit content.

## 2026-09-24 — Tool 2.4 rebuilt to user spec: Split-Half Isolator
- Tool 1.1 deferred: user will provide the circuit spec.
- New output/split-half-scenarios.json, 5 scenarios (faults cover Wiring, Sensor, Transmitter, Card, Process):
  SH-01 FT-101 Boiler Feedwater Flow 0-500 GPM, Wiring; SH-02 TT-205 Reactor Outlet Temperature 0-200 °C, Sensor;
  SH-03 PDT-401 Filter Differential Pressure 0-100 inH2O, Transmitter; SH-04 LT-310 Surge Drum Level 2-18 ft, Card;
  SH-05 FT-712 Cooling Water Supply Flow 0-1,200 GPM, Process (isProcessFault: the process really is at LRV).
- Sourced: ranges (Input Library p.16), mA values (Template Pack p.4 table and bands), EU by the p.4 formula, fault descriptions verbatim from Form 7 (p.9). Constructed (tagDerived, labeled on screen): tags, services, fault placement, healthy process %.
- Tool: 7 clickable links (one test point each), 4-probe budget, reading + cut quality (Split-Half Log flag formula) + remaining per probe, guess panel after 2 probes, amber fault reveal with bracketing readings and Form 7 description, non-punitive wrong guess with retry, STOP button when Process reads bad.
- Log columns: Step | Measure At | Actual | Good/Bad | Cut Quality | Remaining.
- XP: 35 first pass, 10 on retry, 0 on replay (persisted played set). Radar: 0.8 instrumentation per first-pass correct (onResult now takes a per-tool radar step; default 0.4).
- Keys: 1-7 probe (or select once probing is done / link already probed), Enter confirm, Esc new scenario.
- Persistence: techDevLab.v3.splitHalf; the earlier techDevLab.v3.splitHalfIsolator key is removed on load.
- Verified headless from disk: all flows above incl. wrong guess + retry (10 XP), eliminated-nothing probe, budget cap, STOP path, replay 0 XP, reload, reset, phone width. 1.4 and 3.4 regressions pass. No console errors.
- File: output/tech-dev-lab.html

## 2026-09-24 — Tool 1.1 built: Wire It Live
- Source: user spec saved verbatim to sources/wire-it-live-spec.md; drawing is sources/wire-it-live-circuit.png.svg (an SVG, not a PNG). Both listed in context/source_materials.md.
- Content library: new "wireItLive" section (18 terminals at the drawing's positions, 6 target nets = 12 wires, operation lines, 5 faults verbatim). Skill 02 has a new Step 6c.
- Tool: SVG schematic with the drawing's symbols; wire by click-click, drag, or the From/To wire list; right-click or Delete removes a wire; Tab/Enter/Escape on terminals. The circuit is simulated from the placed wires (NC/NO contacts, CR seal-in latch, one-way diode, short = PSU fold-back). Energize runs a 9-step test from the spec's Operation (START, release, STOP, START again, OL trip/reset) with an animated cyan current pulse; afterward START/STOP (hold), OL trip, and power are manual.
- Faults: F1 (seal-in unwired), F3 (diode reversed -> short), F5 (seal-in branch partly wired) as written. F2 and F4 detected by the miswires that produce the spec's consequences (STOP outside the holding path; OL outside the CR coil path) and named that way in the quiz; F2 shows only the spec's "cannot be stopped" clause. OL wired after the coil still drops CR and is reported as "runs, but not as drawn". Missing diode also "not as drawn" with the spec's diode line.
- XP: 1 per correct wire (each once, capped at 12), 15 for latching as drawn (first time), 5 per fault named on the first pick (first time per fault). Radar: 0.4 electrical on the first latch.
- Shared: Btn shows its disabled state; results without firstTry leave the streak alone; @keyframes flow added.
- Verified headless from disk: 12-wire build (12 XP), duplicate-net wire 0 XP, energize run 9/9 pass (15 XP, radar 0.4), 10 wires animated with START held, manual latch/stop by keyboard, all 5 faults + quiz (5 XP each), not-as-drawn cases, empty board, right-click and keyboard delete, reload, reset, phone width. 1.4, 2.4, 3.4 regressions pass. No console errors.
- File: output/tech-dev-lab.html
- Layer: Electrical (Tool 1.1 of 4)

## 2026-09-24 — Calculators extraction + Tools 2.2 and 2.3
- Fault 2/4 deviations in tool 1.1 approved by the user.
- Skill 02 Step 6d: content-library.json now has "calculators" read cell-by-cell from Field Troubleshooting Calculators.xlsx (Start Here C10 formulas and C11 NAMUR note; mA Converter C12 alarm bands (9), 5% reference table I5:K26; Cal Record points B14:B20, tolerance 0.5 (C10), error / PASS / hysteresis formulas, "Action taken" dropdown (C27: No adjustment, Zero trim, Span trim, Zero and span trim, Sensor trim, Re-range only, Repaired, Replaced), B40 failure mode, full PT-101 example; Loop Check B21:B24 and its TT-205 example), plus "calRecordForm" (Form 5 labels, Template Pack p.7), "lrvUrvRanges" (15 rows, Input Library p.16), and "calScenarios" (PT-101 = the sheet's example; TT-205 range from Loop Check, LT-310 range from p.16, error patterns per user spec, constructed fields marked). All verified; 0 problems.

## 2026-09-24 — Tool 2.2 built: Scaling Bench
- Bench: mA slider 3.0-21.5 (0.01 steps, arrow keys) + numeric entry; LRV/URV/units (default 0-100 psi); live mA, % span, EU readouts; reverse-acting toggle (formula derived and labeled as derived); the sheet's formulas shown verbatim with live numbers.
- Check Mode: one challenge per p.16 range (15), random % in 2.5% steps; ±0.02 mA; Enter checks; wrong shows the I = 4 + 16 x (EU - LRV) / (URV - LRV) work. XP 15 first try / 5 retry / 0 replay (per range). Radar 0.4 per first-pass correct.
- Expandable 5% reference table (sheet's % and mA; EU worked for the bench range).
- Persistence: techDevLab.v3.scalingBench.

## 2026-09-24 — Tool 2.3 built: Cal Record Builder
- Scenarios: PT-101 (sheet example, span error +0.125 to +1.125%, Span trim, sheet as-left), TT-205 (0-200 °C, +0.75% zero shift, Zero trim), LT-310 (2-18 ft, span error with 0.375% hysteresis at 50%, Span trim; follows the sheet's PT-101 precedent of Span trim with hysteresis present).
- Bench: 7 points in order, output settles before Record; LRV/URV and tolerance editable. Any trim before all 7 are recorded: red flash, "You just destroyed the evidence." + the sheet's B40 line, scenario forfeits XP.
- After recording: error % span, PASS/FAIL, max error, hysteresis at 50% and 0% (sheet formulas). Gate: No adjustment / Zero trim / Span trim / Sensor trim / Replaced (sheet's list wording). Correct = No adjustment if all in tolerance, else the scenario's action. Reasoning quotes Loop Check B23.
- As-left table and a printable Form 5 record (Template Pack p.7 labels) in a new window.
- XP 25 first try / 10 retry / 0 replay or forfeited. Radar 0.6 per scenario solved (first time).
- Persistence: techDevLab.v3.calRecord.
- Verified headless from disk (2.2 and 2.3): readouts, reverse, formulas, arrows, reload; Check Mode wrong/retry/first-try/replay XP (5 / 210 over 14 / 0), radar; reference table; evidence-destroyed path (0 XP); PT-101 table and hysteresis match the sheet; TT-205 +25 and radar 0.6; LT-310 retry +10; tolerance 1.0 -> No adjustment; print window opens; reset; phone width. Regressions 1.1, 1.4, 2.4, 3.4 pass. No console errors.
- File: output/tech-dev-lab.html (6 tools: 1.1, 1.4, 2.2, 2.3, 2.4, 3.4)

## 2026-09-24 — Tool 2.3 tolerance note + threshold flag
- All six 2.2/2.3 decisions approved by the user.
- Tool 2.3: when the tolerance field is focused, a note appears: "Tolerance is a site judgement call. Different plants set different windows. Watch how the PASS/FAIL verdict changes as you widen or narrow it."
- content-library.json: new "toolConventions" section; calRecord.sameSizeSpreadPct = 0.125 with "constructed": true (tool convention, not source-derived). Tool 2.3 now reads the threshold from it instead of a hard-coded constant.
- Verified: note hidden until the field is focused, then shown; TT-205 still classed zero error, PT-101 span; 2.2/2.3 suite passes; no console errors.

## 2026-09-24 — Layer 3 source extraction pass (no build)
- Searched all sources page by page for I/O addressing, XIC/XIO/OTE, permissives, interlocks, TON/TOF/RTO, timers, ladder, seal-in, scan, first-out.
- PDFs: topics named (Field Learning Plan p.2, 12, 13-14; 80_20 p.1, 7, 9, 10; Input Library p.6, 8, 10, 12, 14, 15; Template Pack p.5, p.10; course-design p.3, p.5; Drill Pack p.10) but no I/O lists, addresses, rungs, permissive sets, or timer definitions.
- Timers: only the word "timers" in the PLC domain list (Field Learning Plan p.2 / 80_20 p.1).
- sources/tech-dev-lab.html (reference build, v1) has full 3.1/3.2/3.3 implementations (RACK31, PERM32, TimerTrace) with no citations: authored content, not source material.
- Verdicts: 3.1 needs constructed I/O data; 3.2 lesson sourced, permissive set needs construction; 3.3 needs a source or fully constructed content. Awaiting user decision.

## 2026-09-24 — Tools 3.1 and 3.2 built (constructed content)
- User rules: construct convention (platform, addresses, ISA tags, rungs, permissive chains), never field facts; every constructed object carries "constructed": true, source "constructed — training scenario, no source citation", and a TRAINING CONTENT badge on screen. Tool 3.3 Timer Trace deferred until the user supplies a timer reference.
- content-library.json: "plcIoMap" (CompactLogix local chassis, 8 slots: controller, DI 16, DO 16, AI 8, AO 4, 3 empty; 20 points across CV-101, P-201, AG-301; 4 rungs; conventions), "permissiveCircuit" (P-401, rung 40, 5 permissives incl. 3 s lube delay and the XIO VFD fault), "plcLessons" (sourced, verbatim: Field Learning Plan p.2, p.12 blocks 5 and 6, p.14 step 5, trap 5; Input Library p.6, p.8, p.14). Instrument tags use only the Input Library p.12-13 letter codes. Analog points show Signal OK / FAULTED, no values.
- Tool 3.1 I/O Map Inspector: chassis with 8 slots (keys 0-7), per-slot I/O map (Local:slot:I.Data.n / O.Data.n / I.ChnData / O.ChnData), ladder cross-reference with live true/false, fault injection on 9 single-rung permissive inputs, mark source + dropped output, check. Wrong marks explained (run feedback is a symptom; output still ON). Solved trace quotes block 5 and step 5. XP 20 / 8 / 0 (played per faulted input), radar 0.5 PLC. Key techDevLab.v3.ioMap.
- Tool 3.2 Permissive Detective: 5 series contacts (XIC/XIO), field panel with physical states; mark open contacts (keys 1-5, Enter), then operate field devices (lube 3 s pressure build) until P401_RUN energizes; forcing one open drops it (block 6). Lessons: XIC/XIO convention (constructed), Input Library concepts, block 6, trap 5. XP 20 / 8 / 0 (played per open-contact combination), radar 0.5 PLC. Key techDevLab.v3.permissiveDetective.
- Verified headless from disk: badges and constructed source lines, addresses, fault injection + card FLT + rung OFF, wrong trace (feedback) then retry 8 XP, first try 20 XP + radar 0.5, replay 0 XP, reload; 3.2 wrong diagnosis then retry 8 XP, lube pending then running, forced open drops OTE, new session first try 20 XP + radar; phone width; reset clears both keys. Regressions 1.1, 1.4, 2.2, 2.3, 2.4, 3.4 pass. No console errors.
- File: output/tech-dev-lab.html (8 tools: 1.1, 1.4, 2.2, 2.3, 2.4, 3.1, 3.2, 3.4)

## 2026-09-24 — Cross-cutting: diagnostic ribbon, Field Notes drawer, note backfill
- content-library.json: "diagnosticSequence" (6 steps, name + description verbatim, course-design.pdf p.2) and "templateForms" (Forms 1-7 titles with pages, Template Pack p.2-9). Verified.
- Diagnostic ribbon: 32 px, mono uppercase, 2 px letter-spacing; active step cyan with 2 px underline, steps passed this round dim to gray, 180 ms color transition (none with reduced motion). Shown only on tools with a step mapping: 3.4 (1 card / 4 choosing / 5 solved), 2.4 (3 probing / 4 guess / 5 correct), 2.3 (3 recording / 5 action / 6 record generated = solved), 2.2 (1 question / 5 correct), 3.1 (3 inspecting / 4 marking / 5 correct), 3.2 (3 marking / 5 diagnosed). Silent on Layer 1 and unbuilt tools. A lower step than already reached starts a new round.
- Field Notes: logFieldNote() writes { at, tool, toolName, tag, text } to techDevLab.v3.fieldNotes (oldest first) and signals the drawer. Notes previously kept in the app state migrate once. Drawer: status-strip button (book icon + count) or Ctrl/Cmd+B; Escape closes; 380 px desktop, full width under 900 px; newest first; empty state per spec; two-step "Clear all notes"; "Export as Markdown" (header with date, level, XP; notes grouped by tool, chronological; matching Template Pack form title under 2.2, 2.3, 2.4, 3.4). Reset progress clears notes.
- Backfill: one-line notes on correct decisions in all 8 tools, "[Tool] [tag]: [decision] — [reason]", reasons taken only from existing sourced or labeled content (spec operation line, trap fix, sheet formula, Loop Check line, Form 7 line, rung cross-reference, XIC/XIO convention, option reason). 1.1 no longer logs failed runs or quiz answers.
- Verified headless: every ribbon mapping and dimming, ribbon 32 px, drawer 380 px / full width, Ctrl+B, Esc, entries, migration, Markdown export file contents, clear confirm, phone width; regressions 1.1, 1.4, 2.2, 2.3, 2.4, 3.1, 3.2, 3.4 pass; no console errors.
- File: output/tech-dev-lab.html

## 2026-09-24 — Diagnostic ribbon + Field Notes drawer
- Diagnostic ribbon: the six-step sequence from content-library.json "diagnosticSequence" (course-design.pdf p.2), cited in the ribbon's label/title. Shown on tools 2.2, 2.3, 2.4, 3.1, 3.2, 3.4 (registry flag ribbon: true); not on Layer 1. Tools report their step through onStep; the active step lights, the steps passed this round dim.
  - 3.4: card 1, choosing 4, solved 5. 2.4: probing 3, guess 4, correct 5. 2.3: recording 3, action 5, record generated 6. 2.2: question 1, correct 5. 3.1: inspect 3, trace 4, correct 5. 3.2: marking 3, diagnosed 5.
- Field Notes drawer: one line per correct decision from every tool (time, tool, tag, text), newest first. Stored under techDevLab.v3.fieldNotes; the old app-state fieldNotes are migrated there on load and cleared. Opened by the "Open Field Notes" button; Esc closes; focus goes to the title.
- Export as Markdown: tech-dev-lab-field-notes-YYYY-MM-DD.md with date, level, and XP. Notes are grouped by tool, and each group names its matching Template Pack form from content-library.json "templateForms" (2.2 Form 3 p.4, 2.3 Form 5 p.7, 2.4 Form 2 p.3, 3.4 Form 7 p.9).
- Clear all notes needs a second click to confirm; the empty state reads "Nothing logged yet. Every correct decision writes a line here."
- Verified headless from disk: migration, ribbon states on all six tools, none on Layer 1, 9 notes written, drawer open/focus/entries, export file and content, Esc, two-step clear, phone width (drawer full width, no overflow) with reduced motion. Regressions 1.1, 1.4, 2.2, 2.3, 2.4, 3.1, 3.2, 3.4 pass. No console errors.
- Known test debt: test24v2 and test34 still count notes in app state (they now read 0); notes live in techDevLab.v3.fieldNotes. The cross test covers them.
- File: output/tech-dev-lab.html (338,799 bytes)

## 2026-09-24 — Regression re-run after usage-limit interruption
- The draft (draft-tech-dev-lab.html, 338,799 bytes) was still in the previous session's scratchpad. It is byte-identical to output/tech-dev-lab.html, which commit 6f8b239 already includes, so nothing needed copying.
- Re-ran the full headless suite (Edge) against output/tech-dev-lab.html: 1.1, 1.4, 2.2/2.3, 2.4 (test24v2), 3.1/3.2, 3.4, and cross-cutting (ribbon on all six tools, none on Layer 1, notes migration, drawer, Markdown export, Esc, two-step clear). All pass. No console errors.
- Drawer width measured at fixed viewports: 380 px at 1400 and 900; full width at 899 and 390; no horizontal scroll.
- test24.mjs (v1) fails because it reads the retired key techDevLab.v3.splitHalfIsolator. test24v2 replaced it and confirms the old key is removed. This is obsolete test code, not an app regression.
- Log housekeeping: the two entries above ("Cross-cutting: diagnostic ribbon..." and "Diagnostic ribbon + Field Notes drawer") describe the same build.
- Still open: test24v2 and test34 read field notes from app state (report 0). test_cross covers notes.
- File: output/tech-dev-lab.html (unchanged)

## 2026-09-24 — Day/night theme toggle
- Palette split into C_DARK (unchanged values) and C_LIGHT (user-specified). Same shape and token names as before (signal_cyan kept, not renamed to cyan). ThemeCtx provides the active palette; every component that used C (33) now reads it with useC(). The module-level C is gone, so a missed use throws instead of silently staying dark.
- H, Btn, Chip took palette defaults in their parameter lists; those defaults moved into the body (color ?? C.x). LAYERS accents are now token names ("signal_cyan", "violet") resolved as C[layer.accent].
- Toggle: ghost button in the status strip between Sound and Reset. Sun icon in dark (switches to light), moon in light. SVG, no emoji. Ctrl/Cmd + J toggles. Stored as plain "dark" | "light" under techDevLab.v3.theme; default dark.
- 200 ms fade on background, border, and text color, applied only while switching (html.theme-fade class, removed after 220 ms); skipped with reduced motion.
- Reset: clearToolStorage() skips techDevLab.v3.theme, which the techDevLab.v3.* sweep would otherwise erase.
- A one-line script at the top of the body paints the light background before React mounts, so light-mode users don't get a dark flash.
- Contrast (WCAG): body text 15.9:1 dark / 16.7:1 light on bg; text_mute 5.3 / 7.1. Light accents on bg: cyan 5.0, amber 4.7, lime 4.7, rose 5.9, violet 6.7. text_dim is 2.5 dark / 2.4 light on bg: below 4.5 in both themes, same as the existing dark design. It is used for labels, not body text. Not changed.
- Verified headless (test_theme): default dark with key written; all 8 tools render in both themes; ribbon uses each theme's cyan and mute; no colors from the other palette in any tool or the drawer; drawer bg/title follow the theme; fade class on during switch and off after; persists across reload; Ctrl+J and Cmd+J toggle; Reset keeps theme=light and clears progress; phone width no overflow, toggle 44 px tall. Regressions 1.1, 1.4, 2.2/2.3, 2.4, 3.1/3.2, 3.4, cross-cutting pass; differences from the previous run are only in randomly dealt content. No console errors in either theme.
- File: output/tech-dev-lab.html (343,165 bytes)

## 2026-09-24 — text_dim contrast (WCAG AA) + passed-step underline on the ribbon
- text_dim: C_DARK "#4a5464" → "#7a8699" (5.25:1 on bg, 4.84:1 on panel); C_LIGHT "#9ca3af" → "#6b7280" (4.55:1 on bg, 4.83:1 on panel). Both pass AA; no further darkening needed.
- Side effect: in dark mode text_dim now equals text_mute, so passed ribbon steps lost their color difference. Fix (user option 3): each ribbon label sits in a span with padding-bottom 3 px; passed steps get a 1 px text_mute underline. Active keeps the 2 px full-width cyan bar; upcoming has no line. The padding applies to every label so labels don't shift between states.
- Verified headless in both themes on tool 3.4 after one solved card (passed 1 and 4, active 5, upcoming 2, 3, 6): computed styles match; grayscale screenshots still separate the three states. Theme test and regressions (1.1, 1.4, 2.2/2.3, 2.4, 3.1/3.2, 3.4, cross) pass; no console errors. test_cross's dimmed-step detector still looks for the old #4a5464, so it now reports no dimmed steps; the underline check replaces it.
- Found, not fixed (predates this change): at a 1400 px window the ribbon nav is 872 px wide and ends 52 px past the main column, so "6. DOCUMENT" is hidden under the helper column. It fits at 1920 px.
- File: output/tech-dev-lab.html

## 2026-09-25 — Ribbon overflow at mid widths
- Cause: the tool panel is an item in main's CSS grid with min-width auto, so it grew to the ribbon's one-line label width (872 px) and slid under the helper column below about 1500 px. The ribbon's own overflow-x: auto never engaged.
- ToolSlot panel: minWidth 0, so it stays in its column. Ribbon ol: min-width max-content (was 680), so the nav scrolls when the labels don't fit.
- Ribbon labels: letter-spacing and padding moved to a .diag-step class (2px / 0 6px); below 1500 px: 1px / 0 2px. Vertical padding kept at 0 (not 6px) so the 1 px passed-step underline isn't clipped in the 32 px row when the scrollbar shows.
- Scrollbar: .diag-ribbon, thin, 6 px webkit height, transparent until hover, then the theme's border color via a --rib-thumb custom property set from C.border.
- Active step auto-centers when it changes. It scrolls the ribbon only (nav.scrollTo), not scrollIntoView: scrollIntoView would also scroll the page up to the ribbon whenever a step changes while the user is working lower down. Smooth, or instant with reduced motion.
- Verified headless, both themes, at 900 / 1200 / 1400 / 1920: ribbon 32 px tall at every width; scrolls at 900 (275 px for 724 px of labels) and 1200 (575 px), with step 6 reachable and the active step fully visible after each change (steps 1, 4, 5 on tool 3.4); fits without scrolling at 1400 (775 of 775); 1920 unchanged (2px / 6px spacing, 1295 px, no scroll). Tool panel inside main on all six ribbon tools at every width. Theme test, ribbon underline check, and regressions (1.1, 1.4, 2.2/2.3, 2.4, 3.1/3.2, 3.4, cross) pass; no console errors.
- Found, not fixed: at 900 and 1200 px, tool content wider than the panel spills past it. 2.4 diagnostic chain 700 px, 3.1 chassis 714 px, 3.2 rung 760 px, 2.3 31 px over at 900 only. At 900, 2.4 and 3.1 cause page horizontal scroll. The ribbon used to hide this by stretching every ribbon tool's panel (the page scrolled sideways on all six ribbon tools at 900 before this change). Fits at 1400 and up.
- File: output/tech-dev-lab.html

## 2026-09-25 — Narrow-width overflow in tools 2.3, 2.4, 3.1, 3.2
- Cause: the wide content already sat in overflowX: auto wrappers, but each wrapper is a block inside a grid item with min-width auto in the tool's root grid. A scroll box still reports its content's width to that grid, so the grid item grew to 700-760 px and the scroll never engaged. min-width: 0 on the wrapper alone can't help (it isn't the grid item).
- New class .tool-scroll { overflow-x: auto; min-width: 0; contain: inline-size } on the 8 wrappers in those tools: 2.4 split-half chain + split-half log; 2.3 both calibration tables; 3.1 chassis, I/O table, rung list; 3.2 rung. contain: inline-size stops the content's width from reaching the grid, so the box takes the panel width and scrolls. Inner content keeps its fixed widths.
- Scrollbars: .diag-ribbon and .tool-scroll share one rule set (thin, 6 px webkit, transparent until hover, then the theme border color). The color comes from --scroll-thumb on the app root (C.border), replacing the ribbon's own --rib-thumb.
- Focus: browsers don't scroll a partly visible control into view when it takes focus. A document focusin listener in App scrolls the enclosing .tool-scroll just enough to show the focused control in full. Found on 3.2 at 1200 px (contact 5 half hidden); verified it scrolls 78 px and the contact is fully visible, and that without the listener it stays clipped.
- Test note: headless Chrome fires no focus events unless Emulation.setFocusEmulationEnabled is on; test_tool_width turns it on.
- Verified headless (test_tool_width), 8 tools x 900 / 1200 / 1400 / 1920 x dark / light = 64 rows, all pass: no page horizontal scroll; panel inside main; nothing past the panel outside a scroll box; every .tool-scroll inside its panel, scrolling where needed (2.3 at 900; 2.4 and 3.1 at 900 and 1200; 3.2 at 900 to 1400); the last control in each box visible after focus; ribbon 32 px. Theme test, ribbon width and underline checks, regressions (1.1, 1.4, 2.2/2.3, 2.4, 3.1/3.2, 3.4, cross) pass; no console errors.
- File: output/tech-dev-lab.html

## 2026-09-25 — Layer 4 Programming: tools 4.1 Rung Editor, 4.2 HMI Tag Bind, 4.3 Change Control Gate
- Source check first: no source covers change control / MOC, backups, downloads, OTL/OTU/TON behavior, or HMI tag binding. Layer 3 rules applied: construct conventions only, every constructed object "constructed": true + constructed source, TRAINING CONTENT badge on each tool.
- User decisions (2026-09-25): 4.3 uses prerequisite rules, not strict 1-8 order (only Back up can move, anywhere before Edit offline); the 8 rejection reasons drafted by Claude were approved and are labeled constructed (the download-before-backup reason is the user's). Timer tag is T4_0 (TIMER, PRE and ACC shown in seconds) in both 4.1 and 4.3; 4.1 reads its done bit as T4_0.DN, replacing the spec's T4_0_DN tag. 4.3 request 1 reads "Change T4_0.PRE from 5 s to 8 s on Line 2 fill timer".
- content-library.json: new "rungEditor", "hmiTagBind", "changeControl" (constructed) and "programmingLessons" (sourced, verbatim: Input Library p.6 concepts, p.12 "Sensor -> transmitter -> PLC -> HMI", p.14 HMI symptom; Template Pack p.9 Form 7 scaling failure mode, p.5 approval and drawing revision lines, p.6 documentation line). Existing keys unchanged. Embedded as RUNG, HMI, CCG, PROG_LESSONS.
- 4.1 Rung Editor: 8-tag database, palette XIC/XIO/OTE/TON/OTL/OTU (Rockwell behavior as platform convention), 3 goals (c3 has two rungs: TON, then XIC T4_0.DN → OTE). Drag from palette to slot, or keys 1-6 + click; click a placed instruction to remove; per-instruction tag select. Live truth table (Gray-code steps, two scans per step, timer steps off / 0 s / 3 s / 5 s / released); Test reveals the Goal column and hints (missing output, wrong output tag, OTL never unlatched, no TON, DN unread). Key techDevLab.v3.rungEditor.
- 4.2 HMI Tag Bind: 6 tags (ranges per spec), 5 elements (level bar, pump run, valve position, header pressure numeric, temperature trend) labeled by service, field panel with the plant's real state. Drag a tag onto the target element, or keys 1-6 + Enter. A wrong tag shows what the element would display (TT_301 on the valve: POS 145.0 %) and why, from type and range. Completion cites the p.14 symptom and Form 7 failure mode. Key techDevLab.v3.hmiTagBind.
- 4.3 Change Control Gate: 3 requests, 8 steps shuffled; click, drag, or keys 1-8 to add; a step placed before a step it needs is rejected with the reason. Completion cites Template Pack Form 4 lines; request 2 adds Field Learning Plan p.12 block 6, request 3 the p.14 symptom and Form 7 failure mode. Key techDevLab.v3.changeControlGate.
- XP 20 / 8 / 0 per goal, element, and request (first try / retry / replay); radar +0.5 Programming on first-try passes; Field Notes line on every success; decision log in each tool.
- Verified headless: test_l4 (wrong-kind drop rejected, drag and drop in all three tools, OTL failure hint, retry 8 XP, first try 20 XP, timer challenge wrong then right, replay 0 XP, radar, 11 Field Notes, reload persists, Reset clears the three keys, badges and constructed lines on each tool). test_tool_width: 11 tools x 900/1200/1400/1920 x dark/light = 88 rows, no page scroll, no spills, scroll boxes reachable. test_theme sweep now includes 4.1-4.3: no colors from the other palette. Regressions (1.1, 1.4, 2.2/2.3, 2.4, 3.1/3.2, 3.4, cross, ribbon width and underline) pass; no console errors. Screenshots checked for 4.1, 4.2 (1400 and 900), 4.3 in both themes.
- Deviation: skills/03-build-tool Step 5 (show a 20-line sample and wait for approval before writing output) was skipped because the user asked to write, commit, and push in the same request.
- File: output/tech-dev-lab.html (409,090 bytes; 11 tools: 1.1, 1.4, 2.2, 2.3, 2.4, 3.1, 3.2, 3.4, 4.1, 4.2, 4.3)
