# Tool 3.3 Timer Trace: source model (user-provided spec, 2026-09-25)

Platform: Rockwell Automation Logix 5000, TON instruction.
Source: 1756-RM018 (Logix 5000 Controllers General Instructions),
TON section. Note: this supersedes the older 1756-RM003 — cite
the correct manual.

Locked behavior (normal, non-retentive TON only):

State regions:
- RUNG_IN = 0:  EN=0, TT=0, DN=0, ACC=0
- RUNG_IN = 1 and ACC < PRE:
    EN=1, TT=1, DN=0, ACC accumulates
- RUNG_IN = 1 and ACC >= PRE:
    EN=1, TT=0, DN=1, ACC holds at PRE
- RUNG_IN transitions to 0:
    EN=0, TT=0, DN=0, ACC resets to 0

Constraints:
- Do NOT model RTO (retentive) behavior
- Do NOT show DN high before ACC reaches PRE
- Do NOT show TT remaining high after DN is set
- Do NOT show ACC at exactly PRE — it is "at or above PRE"
- Do NOT invent timing accuracy or scan-time behavior

Interaction:
- Preset: T4.PRE = 2000 ms (user-editable 500–10000)
- A run/pause button starts the simulated rung input
- Live display of RUNG_IN, EN, TT, DN, ACC, PRE as both:
  * A four-row waveform chart (Rung, EN, TT, DN) drawn from the
    state regions above
  * A numeric readout of ACC / PRE
- A manual "drop the rung" button that resets the timer
- A short quiz: given a state, predict the next state of EN, TT, DN
- XP: 20 / 8 / 0. Radar: +0.5 PLC.
- Persistence: techDevLab.v3.timerTrace
- Every waveform transition must be traceable to the state model above
