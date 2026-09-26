# Tool 1.3 Contact Logic Puzzle: source model (user-provided spec, 2026-09-25)

Source model (locked — do not invent additional behavior):

Inputs:
- STOP: physical NC contact. 1 = released/path intact,
  0 = pressed/path open.
- START: physical NO contact. 1 = pressed/closed.
- M1_AUX_PREV: physical NO holding contact driven by previous
  M1 coil state. 1 = previously energized, 0 = previously off.

Output: M1_COIL = STOP AND (START OR M1_AUX_PREV)
State:  M1_AUX_NEXT = M1_COIL

Truth table to display (do not modify):
STOP START M1AUX → COIL
0    0     0     → 0    (Stop pressed)
0    0     1     → 0    (Stop drops latched coil)
0    1     0     → 0    (Stop overrides Start)
0    1     1     → 0    (Stop overrides every parallel branch)
1    0     0     → 0    (Idle)
1    0     1     → 1    (Valid latched/running state)
1    1     0     → 1    (Start energizes)
1    1     1     → 1    (Remains energized)

Interaction:
- Show the rung with STOP (NC), START (NO) parallel to M1 AUX (NO),
  and M1_COIL
- The user toggles STOP, START, and clicks "next state" to advance
  the M1_AUX_PREV state
- The live truth table highlights the current row
- Show the latching sequence as a walkthrough: idle → press START
  → coil on → release START → coil stays on (sealed) → press STOP
  → coil drops
- XP: 20 / 8 / 0. Radar: +0.5 electrical.
- Persistence: techDevLab.v3.contactLogic
- TRAINING CONTENT badge on all constructed content
