// Tool 1.3 Contact Logic Puzzle.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run, sleep } from "./lib.mjs";

// The spec's table, read from the source file itself.
const spec = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "sources", "contact-logic-spec.md"), "utf8");
const specRows = [...spec.matchAll(/^([01])\s+([01])\s+([01])\s+→ ([01])\s+\((.+)\)\s*$/gm)].map(m => `${m[1]}${m[2]}${m[3]}${m[4]} ${m[5]}`);

await run("1.3 Contact Logic Puzzle", async (p, check) => {
  await p.fresh();
  await p.tool(1, "1.3");
  const table = () => p.ev("[...document.querySelectorAll('table[aria-label=\"Truth table\"] tbody tr')].map(r => [...r.cells].map(c => c.textContent.replace('→ ', '')).join('|'))");
  const current = () => p.ev("(() => { const r = document.querySelector('table[aria-label=\"Truth table\"] tr[aria-current]'); return r ? [...r.cells].map(c => c.textContent.replace('→ ', '')).join('|') : 'none'; })()");
  const rung = () => p.ev("document.querySelector('svg[aria-label^=\"Rung\"]').getAttribute('aria-label')");
  const verdict = () => p.ev("[...document.querySelectorAll('main [role=status]')].map(v => v.textContent).join(' || ')");

  const shown = (await table()).map(r => { const c = r.split("|"); return `${c[0]}${c[1]}${c[2]}${c[3]} ${c[4]}`; });
  check("spec file has 8 rows", specRows.length === 8, specRows);
  check("truth table matches the spec exactly", JSON.stringify(shown) === JSON.stringify(specRows), shown);
  const formulaOk = specRows.every(r => Number(r[3]) === (Number(r[0]) & (Number(r[1]) | Number(r[2]))));
  check("every row satisfies STOP AND (START OR M1_AUX_PREV)", formulaOk);
  const m = await p.text("main section");
  check("badge, spec source, constructed line", m.includes("TRAINING CONTENT") && m.includes("sources/contact-logic-spec.md") && m.includes("constructed — training scenario"));
  check("walkthrough starts at Idle", (await current()).endsWith("Idle") && (await rung()).includes("M1_COIL off"), await current());

  // Walkthrough with one miss.
  await p.blur();
  await p.key("2");
  check("wrong prediction: contact states, no answer", (await verdict()).includes("Not OFF") && (await verdict()).includes("START closed (pressed)") && (await current()).endsWith("Idle"), await verdict());
  await p.key("1");
  check("press START: Start energizes", (await verdict()).includes("M1_COIL ON: Start energizes.") && (await current()) === "1|1|0|1|Start energizes", await current());
  await p.key("1");
  check("next state: Remains energized, AUX picks up", (await current()) === "1|1|1|1|Remains energized" && (await verdict()).includes("M1_AUX_NEXT = M1_COIL"), await current());
  await p.key("1");
  check("release START: sealed", (await current()) === "1|0|1|1|Valid latched/running state" && (await rung()).includes("START open") && (await rung()).includes("M1_COIL energized"), await rung());
  const xp0 = await p.xpNum();
  await p.key("2");
  check("press STOP: drops", (await current()) === "0|0|1|0|Stop drops latched coil", await current());
  check("sequence done after a miss: 8 XP", (await p.xpNum()) - xp0 === 8 && (await verdict()).includes("with 1 miss"), String((await p.xpNum()) - xp0));
  check("radar unchanged after a miss", (await p.radar()).includes("Electrical 0,"), await p.radar());
  const note = await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.fieldNotes') || '[]').filter(n => n.tool === '1.3').map(n => n.text)");
  check("field note cites the sealed and dropped rows", note.length === 1 && note[0].includes("Valid latched/running state") && note[0].includes("Stop drops latched coil"), note);

  // Replay: 0 XP.
  await p.key("Enter");
  for (const k of ["1", "1", "1", "2"]) await p.key(k);
  check("replay worth 0 XP", (await p.xpNum()) - xp0 === 8);

  // Clean first pass after reset: 20 XP and radar.
  await p.reset();
  await p.tool(1, "1.3");
  const xp1 = await p.xpNum();
  await p.blur();
  for (const k of ["1", "1", "1", "2"]) await p.key(k);
  check("clean sequence: 20 XP, radar +0.5 electrical", (await p.xpNum()) - xp1 === 20 && (await p.radar()).includes("Electrical 0.5"), `${(await p.xpNum()) - xp1} ${await p.radar()}`);

  // Bench: toggles and Next state.
  await p.click("Bench mode");
  check("bench starts idle", (await current()).endsWith("Idle"), await current());
  await p.click("START pushbutton");
  check("bench START: 1 1 0", (await current()) === "1|1|0|1|Start energizes");
  await p.click("Next state");
  await p.click("START pushbutton");
  check("bench sealed after Next state and release", (await current()) === "1|0|1|1|Valid latched/running state");
  await p.click("STOP pushbutton");
  check("bench STOP drops", (await current()) === "0|0|1|0|Stop drops latched coil" && (await rung()).includes("STOP open"));
  await p.click("Next state");
  await p.click("STOP pushbutton");
  check("bench back to idle", (await current()).endsWith("Idle"));
  await p.click("START pushbutton");
  await p.click("START pushbutton");
  check("START released before Next state: not sealed (Idle)", (await current()).endsWith("Idle"), await current());

  // Reload persists the mode and bench state; phone width; reset clears.
  await p.click("START pushbutton");
  await p.load();
  await p.tool(1, "1.3");
  check("reload keeps bench mode and state", (await current()) === "1|1|0|1|Start energizes", await current());
  await p.viewport(390, 844, true);
  check("phone width: no horizontal overflow", await p.ev("document.documentElement.scrollWidth <= innerWidth"));
  await p.send("Emulation.clearDeviceMetricsOverride");
  await sleep(200);
  await p.reset();
  check("reset clears the sequence", (await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.contactLogic') || '{}').played")) !== true);
});
