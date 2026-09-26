# Skill: Extract Content From Sources

## Name
Extract field symptoms, drill templates, and beginner traps from source
files into structured JSON.

## Description
Trigger when the user says: "extract symptoms," "pull the content from
sources," or "build the content library." Produces output/content-library.json
containing all symptoms, drills, and traps, each with a source citation.

## Contents

### Step 1: Identify sources
Read context/source_materials.md. Identify every source file listed.
Verify each file exists in sources/ before starting.

### Step 2: Read each source
For each PDF, try in this order:
1. Direct text extraction (pdfplumber, PyPDF2, or similar)
2. If that returns empty or garbage, use vision to read the pages as images
3. If neither works, report which file could not be read and continue

For the XLSX file, read every sheet and every cell with a value.

### Step 3: Extract field symptoms
From sources/IC_Fundamentals_Drill_Input_Library.pdf pages 13-15, extract
every field symptom. For each, produce this JSON shape:

{
  "id": "sig-XXX",
  "category": "4-20 mA" | "Discrete" | "Pressure" | "Level" |
              "Flow" | "Temperature" | "Control Valve" | "Signal Integrity" |
              "PID/Process Control",
  "tag": "PT-101",
  "service": "Short descriptive phrase",
  "symptom": "One-sentence symptom as the operator would report it",
  "source": "IC_Fundamentals_Drill_Input_Library.pdf p.XX",
  "options": [
    {
      "text": "First move option",
      "correct": true | false,
      "cost": "part" | "endnode" | "redundant" | "premature" |
              "destroy" | "mask" | "verify" | "critical",
      "reason": "Physical reason this is right or wrong",
      "cut": ["Chain", "Links", "Eliminated"]
    }
  ]
}

Rules:
- Exactly 4 options per symptom
- Exactly 1 correct option
- The correct option MUST have a "cut" array listing the diagnostic
  chain links it eliminates. Chain links are:
  ["Process", "Sensor", "Transmitter", "Wiring", "Card", "Controller", "Display"]
- Wrong options get a "cost" tag explaining why they are wrong
- Tags follow ISA-5.1 format (PT-101, LT-205, TT-118, etc.)

#### Tags and services (constructed)
Every symptom gets an ISA-5.1 tag (PT-101, LT-205, TT-118) and a short
service phrase ("Boiler Feedwater Flow", "Reactor Outlet Temperature").
Both are constructed, not extracted. Mark them "tagDerived": true.
Tags must be unique. Letter codes come from the tag practice table in
the Input Library pages 12-13 (PT, PI, PIC, PSH, PSL, PDT, TT, TI, TIC,
TSH, FT, FI, FIC, FSL, LT, LI, LIC, LSH, LSL, FV, PV, LV, TV, XV, ZS,
ZSO, ZSC). Keep service phrases from hinting at the answer. Tag and
service are the only constructed fields; everything else is extracted.

#### Answer sources
Correct first moves and wrong moves come only from these, verbatim:
- Template Pack (sources/Field Troubleshooting Template Pack.pdf) p.9-10,
  Form 7 "Master Diagnostic Checklists by Symptom": ordered steps, most
  ending in a "Failure mode:" line (a wrong move in the source's words).
- course-design.pdf p.2, "The Seven Filmed Field Faults": each fault's
  key diagnostic lesson.
- course-design.pdf p.2, Capstone Scenario (PIC-510 "hunting": cause is
  the air-supply regulator, not controller tuning). Wrong-answer source
  for "Valve hunts or cycles".
- Form 7 "Reading is noisy or jumping" failure mode ("adding damping
  until the symptom disappears and the fault stays"). Wrong-answer source
  for "Reading is slow or sticky" and "Valve hunts or cycles", which
  have no Failure mode line of their own.
- Field Learning Plan.pdf p.13-14, "Where to look first (30-second
  diagnostic sequence)", steps 1-5 ("Check the drawing..." through
  "Check the PLC..."). Correct first-move source for Discrete/PLC
  symptoms.
- Field Learning Plan.pdf p.10, beginner traps 5 ("Skipping the
  permissives") and 6 ("Misreading sourcing vs sinking"). Wrong-answer
  sources for Discrete/PLC symptoms, using the move each trap describes
  (a verbatim excerpt of "What It Looks Like").

#### Matching a symptom to an answer pattern
For each symptom, match in this order:
1. Exact heading match (symptom phrase matches a Form 7 category
   heading word for word)
2. course-design fault lesson (only when it names the same failure
   mechanism as the symptom)
3. Failure mode match (symptom's failure mode matches a checklist's)
4. Measurement type match (e.g. "RTD reads open" -> temperature)
5. If none match: "needsReview": true with "candidateCategories" listed

Record which rule matched in "matchBasis". Discrete/PLC symptoms with
no Form 7 checklist use the 30-second diagnostic sequence.

#### Building the 4 options
Form 7 match:
- Correct = step 1 of the checklist (verbatim)
- Wrong #1 = the checklist's "Failure mode:" line (verbatim), cost by type.
  "slow or sticky" and "hunts or cycles" use the noisy checklist's
  failure mode instead.
- Wrong #2 = the last step before the failure mode (end-node move), cost
  "endnode". For "hunts or cycles" (step 5, PID tuning), also cite the
  course-design capstone.
- Wrong #3 = step 6 or 7, whichever is the most tempting wrong first
  move; if neither is a distinct step, use the next-latest unused step.
  Cost "premature". Skip a step that another option's source names as
  the real cause (for "hunts or cycles", step 4 air supply, so use step 3).

course-design match:
- Correct = the fault's key lesson (verbatim)
- Wrong = three Form 7 failure modes, most related first

Discrete/PLC (30-second sequence):
- Correct = sequence step 1, "Check the drawing..."
- Wrong = trap 5 move (cost "endnode"), trap 6 move (cost "premature"),
  sequence step 5 "Check the PLC..." (cost "premature")

Every option gets "derivedFrom": a list of citations (source file, page,
and step, fault, or trap). An option supported by two sources lists both.

Manual overrides from the user win over these rules; record them in
"matchBasis" and "cutBasis".

If nothing matches, set "options": [] and "needsReview": true. Do NOT
invent options.

#### The cut array
List the chain links the correct first move eliminates, based on where
the move is taken: a reading that agrees with what the controller shows
clears every link downstream of the measurement point (per the
Calculators "Split-Half Log" example). If the move names a cause rather
than a measurement point, leave "cut" empty and say so in "cutBasis".

### Step 4: Extract drill templates
From sources/I&C Fundamentals Drill Pack.pdf, extract all 18 drill templates:

{
  "id": "drill-XXX",
  "name": "Blank-Sheet Fundamentals Dump",
  "whenToUse": "One sentence",
  "steps": ["Step 1", "Step 2"],
  "whyItWorks": "One sentence on the learning science",
  "source": "I&C Fundamentals Drill Pack.pdf"
}

### Step 5: Extract beginner traps
From sources/Field Learning Plan.pdf page 10, extract all beginner traps:

{
  "id": "trap-XXX",
  "trap": "Trap name",
  "looksLike": "What it looks like in the field",
  "fix": "The correct move",
  "source": "Field Learning Plan.pdf p.10"
}

### Step 6: Extract NAMUR bands
From sources/Field Troubleshooting Template Pack.pdf page 4, extract the
NAMUR NE43 signal bands:

{
  "min": 0.0, "max": 0.05,
  "label": "Open Circuit",
  "meaning": "Broken wire, disconnected terminal, or dead power supply",
  "nextCheck": "Loop voltage at both ends",
  "source": "Field Troubleshooting Template Pack.pdf p.4"
}

### Step 6b: Extract split-half content
From sources/Field Troubleshooting Template Pack.pdf page 3 (Split-Half
Isolation Worksheet) and the Calculators "Split-Half Log" sheet, extract
into a "splitHalf" object, verbatim:
- chain: the 7 links from the Split-Half Log (Process, Sensor,
  Transmitter, Wiring, Card, Controller, Display)
- heading and rule from page 3; the sheet's "Measure in the middle" line
- measurementPoints: the 5 worksheet steps
- worksheetColumns and worksheetFooter from page 3
- flags: the sheet's Flag formula (Isolated / Eliminated nothing /
  Weak cut / Good cut) with its thresholds
- example: the LT-301 rows and "Fault isolated to" from the sheet

### Step 6c: Extract the Wire It Live circuit
From sources/wire-it-live-spec.md and sources/wire-it-live-circuit.png.svg,
extract into a "wireItLive" object: terminals (id, name, and the drawing's
x/y), targetNets (from the spec's Wiring section: terminals that must end
up connected), operation lines and the 5 faults (name + consequence),
verbatim from the spec.

### Step 6e: Extract the Wire Count Detective content (tool 2.1)
Build a "wireCount" object, 2-wire and 4-wire only (Input Library p.22
excludes bare RTDs, thermocouples, and 3-/4-wire RTDs from this topology;
3-wire transmitters are out of scope by user decision):
- answerFields: drill 010 step 1, verbatim (Drill Pack p.6)
- mentalModel and progression (device, then topology): Input Library p.22
- tier5: the 10 fault-reconstruction loops, verbatim (Input Library p.21)
- zeroMa: the 0.0 mA row (Template Pack p.4) and the 2-wire trap (Field
  Learning Plan p.10). Shown only for open return conductor and missing
  24 VDC supply; no other fault gets an mA value.
- supplyCheck (Template Pack p.4), meterLocation (p.9), formSupply (p.5)
- challenges: device names from Input Library p.19 / p.21, loops from p.20
  (Tier 1) and p.21 (isolator pairing), verbatim
- terminals, housing marks, jumpers, the 4-wire loop text, and outcome
  wording are constructed conventions: "constructed": true with the
  constructed source line.

### Step 6d: Extract the calculators workbook
From sources/Field Troubleshooting Calculators.xlsx (read the cells and
formulas directly; do not retype them), build a "calculators" object:
- mAConverter.formulas: the Start Here C10 formulas, one per item
- mAConverter.alarmBands: the mA Converter C12 formula's thresholds and
  labels, in order; plus the Start Here C11 NAMUR note
- mAConverter.referenceTable: the 5% step table (I5:K26: % span, mA, EU)
  and the example range it uses (C4:C6)
- calRecord.pointDefinitions (B14:B20), toleranceDefaultPct (C10), the
  error and PASS/FAIL formulas, the "Action taken" dropdown list (C27
  data validation), the failure-mode line (B40), and exampleValues (the
  PT-101 example: as-found, errors, hysteresis, action, as-left)
- loopCheck.readingTheResult (B21:B24) and its example loop (TT-205)
Also extract:
- calRecordForm: the Form 5 field labels from Template Pack p.7
- lrvUrvRanges: the 15 LRV/URV rows from Input Library p.16
- calScenarios: PT-101 from the Cal Record example; any other scenario
  must mark its constructed fields

### Step 7: Verify
- Every item has a source citation with file name and page number
- No invented facts. If a value isn't in a source, do not add it.
- Every symptom has 4 options, exactly 1 correct
- Report any symptoms from the source you could not fit the schema for

### Step 8: Write
- Save to output/content-library.json with this top-level shape:
  {
    "symptoms": [...],
    "drills": [...],
    "traps": [...],
    "namurBands": [...],
    "splitHalf": {...},
    "generatedAt": "2026-09-24",
    "sourceFilesRead": ["list"]
  }
- Append to memory/build_log.md:
  ## [date] — Content extraction
  - Symptoms: N
  - Drill templates: N
  - Beginner traps: N
  - NAMUR bands: N
  - Source files read: [list]
  - Files that could not be read: [list]

### Step 9: Report
Return a summary table: how many of each type, which sources contributed,
and any items you were unsure about. Ask the user to confirm before adding
anything ambiguous.
