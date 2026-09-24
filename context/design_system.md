# Design System — Test Bench

## Palette
| Token       | Hex     | Use                                 |
|-------------|---------|-------------------------------------|
| bg          | #0a0e14 | Page background                     |
| panel       | #121821 | Card/panel surfaces                 |
| border      | #1e2836 | Hairlines                           |
| signal_cyan | #22d3ee | Live signals, values, energized     |
| amber       | #f5a524 | Warnings, presets, setpoints        |
| lime        | #84cc16 | Good, valid, in-range               |
| rose        | #f43f5e | Faults, out-of-range, trips         |
| violet      | #a78bfa | Programming/logic layer             |
| text        | #e5e9f0 | Primary text                        |
| text_mute   | #7a8699 | Secondary text                      |
| text_dim    | #4a5464 | Tertiary, labels                    |

## Typography
- Headers, module titles: Space Grotesk, 700 weight, tight tracking
- Body: Inter, 400/500/600
- Anything representing a value, tag, address, or code: JetBrains Mono
  Examples: AI-101, 4.00 mA, XIC(Start), T4:0.DN

## Motion
- All transitions 120–280ms, ease-out
- No bouncy springs, no confetti, no particle effects
- Scanline animation on live readouts (4s linear loop, opacity 0.4)
- Respect prefers-reduced-motion

## What premium looks like here
- 1px animated scanline on live readouts
- Subtle pulse on energized coils
- Tick marks on gauges and sliders
- Engraved label plates above module bays (uppercase, letter-spacing 2px)
- Soft outer glow on active controls
- No emoji. No clip art. No generic hero images.
