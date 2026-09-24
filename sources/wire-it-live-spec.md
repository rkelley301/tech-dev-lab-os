# Wire It Live — circuit spec (provided by the user, 2026-09-24)

Companion drawing: sources/wire-it-live-circuit.png.svg

## Circuit: 24 VDC Three-Wire Start/Stop Control

### Components
- 24 VDC PSU, terminals + and −
- OL — overload contact, NC, terminals 95-96
- STOP — pushbutton, NC, terminals 11-12
- START — pushbutton, NO, terminals 13-14
- CR — control relay
  - Coil: A1 (+), A2 (−)
  - Aux contact (seal-in): NO 13-14
  - Load contact: NO 23-24
- D1 — flyback diode across CR coil, cathode to A1, anode to A2
- M — motor contactor
  - Coil: A1 (+), A2 (−)
  - Main contacts: M (power circuit not shown)
- MTR-1 — motor

### Wiring
Control rung:
  +24V → OL(95) → OL(96) → STOP(11) → STOP(12) →
  [ START(13) → START(14)  ∥  CR aux(13) → CR aux(14) ] →
  CR coil(A1) → CR coil(A2) → 0V

Diode:
  D1 cathode → CR coil(A1)
  D1 anode   → CR coil(A2)

Contactor rung:
  +24V → CR contact(23) → CR contact(24) →
  M coil(A1) → M coil(A2) → 0V

Motor:
  M main contacts → MTR-1

### Operation
- Press START: CR coil energizes, aux contact 13-14 closes in
  parallel with START, coil stays energized after release.
- Press STOP: NC contact opens, breaks the coil holding path,
  CR drops out, CR contact 23-24 opens, M coil drops out,
  motor stops.
- OL tripping opens the same coil path as STOP.
- The diode suppresses the inductive voltage spike when CR coil
  de-energizes (protects PLC inputs and adjacent contacts).

### Faults to build as edge cases
1. Missing seal-in contact — coil energizes only while START is
   held; drops immediately on release.
2. STOP wired as NO — pressing STOP energizes instead of breaking;
   circuit cannot be stopped from the pushbutton.
3. Diode reversed — anode to A1, cathode to A2. Applying 24V
   short-circuits through the forward-biased diode; PSU folds back.
4. OL in the wrong position (after CR coil) — motor overload no
   longer drops the control relay; the safety function fails.
5. Broken wire in the seal-in parallel branch — CR latches but
   drops the moment START releases.
