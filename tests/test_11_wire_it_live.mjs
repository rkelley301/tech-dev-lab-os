// Tool 1.1 Wire It Live.
import { run, sleep } from "./lib.mjs";

await run("1.1 Wire It Live", async (p, check) => {
  await p.fresh();
  // Reduced motion: the energize sequence finishes at once.
  await p.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await p.load();
  await p.tool(1, "1.1");
  const K = "techDevLab.v3.wireItLive";
  const name = id => p.ev(`WIL_T[${JSON.stringify(id)}].name`);
  const tap = async id => {
    const n = await name(id);
    const ok = await p.ev(`(() => { const g = [...document.querySelectorAll('g[role=button]')].find(g => { const a = g.getAttribute('aria-label'); return a === 'Terminal ' + ${JSON.stringify(n)} || a.startsWith('Terminal ' + ${JSON.stringify(n)} + ','); }); if (!g) return false; g.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; })()`);
    await sleep(60);
    return ok;
  };
  const wire = async (a, b) => { await tap(a); await tap(b); };
  const wires = () => p.ev(`JSON.parse(localStorage.getItem('${K}') || '{"wires":[]}').wires.length`);
  const status = () => p.ev("[...document.querySelectorAll('main [role=status], main [aria-live]')].map(v => v.textContent).join(' || ')");
  const removeWire = async (a, b) => {
    const na = await name(a), nb = await name(b);
    return p.ev(`(() => { const btn = [...document.querySelectorAll('button')].find(x => { const l = x.getAttribute('aria-label') || ''; return l.startsWith('Remove wire') && l.includes(${JSON.stringify(na)}) && l.includes(${JSON.stringify(nb)}); }); if (!btn) return false; btn.click(); return true; })()`);
  };

  // Target nets, with the seal-in aux terminals last so F1 / F5 remove whole wires.
  const nets = await p.ev("WIL.targetNets.map(n => [...n].sort((a, b) => (/^CRa1/.test(a) ? 1 : 0) - (/^CRa1/.test(b) ? 1 : 0)))");
  const pairs = nets.flatMap(n => n.slice(1).map((id, i) => [n[i], id]));
  check("12 wires in the drawing", pairs.length === 12, pairs);
  check("source line cites the spec and drawing", (await p.text("main section")).includes("wire-it-live-spec.md"));

  const xp0 = await p.xpNum();
  for (const [a, b] of pairs) await wire(a, b);
  check("12 wires placed", (await wires()) === 12);
  check("1 XP per correct wire (12)", (await p.xpNum()) - xp0 === 12, String((await p.xpNum()) - xp0));
  await wire("P+", "CR23");
  check("extra wire in a finished net: 0 XP", (await p.xpNum()) - xp0 === 12 && (await wires()) === 13);
  await removeWire("P+", "CR23");
  check("remove button deletes a wire", (await wires()) === 12);

  await p.click("Energize and run the test sequence");
  await sleep(400);
  check("latches as drawn: +15 XP, radar 0.4 electrical", (await p.xpNum()) - xp0 === 27 && (await p.radar()).includes("Electrical 0.4"), `${(await p.xpNum()) - xp0} ${await p.radar()}`);
  const note = await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.fieldNotes') || '[]').filter(n => n.tool === '1.1').map(n => n.text)");
  check("Field Notes line quotes the operation", note.length === 1 && note[0].startsWith("Wire It Live: latched as drawn"), note);

  // Faults and the quiz.
  const quiz = async id => {
    const fname = await p.ev(`WIL_QUIZ_NAME[${JSON.stringify(id)}] || WIL_FAULT[${JSON.stringify(id)}].name`);
    const shown = await p.ev(`[...document.querySelectorAll('button')].some(b => (b.getAttribute('aria-label') || '').startsWith('Option') && (b.getAttribute('aria-label') || '').includes(${JSON.stringify(fname)}))`);
    const before = await p.xpNum();
    await p.ev(`(() => { const b = [...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label') || '').startsWith('Option') && (b.getAttribute('aria-label') || '').includes(${JSON.stringify(fname)})); b && b.click(); return true; })()`);
    await sleep(150);
    return { shown, xp: (await p.xpNum()) - before };
  };
  const auxWires = pairs.filter(([a, b]) => /^CRa1/.test(b));
  for (const [a, b] of auxWires) await removeWire(a, b);
  await p.click("Energize and run the test sequence");
  await sleep(400);
  let q = await quiz("F1");
  check("F1 seal-in unwired: named in the quiz, 5 XP", q.shown && q.xp === 5, q);

  await wire(auxWires[0][0], auxWires[0][1]);
  await p.click("Energize and run the test sequence");
  await sleep(400);
  q = await quiz("F5");
  check("F5 seal-in branch partly wired: 5 XP", q.shown && q.xp === 5, q);
  await wire(auxWires[1][0], auxWires[1][1]);

  // F3: diode reversed -> short.
  const dk = pairs.find(pr => pr.includes("D1K")), da = pairs.find(pr => pr.includes("D1A"));
  await removeWire(dk[0], dk[1]);
  await removeWire(da[0], da[1]);
  await wire(dk[0] === "D1K" ? dk[1] : dk[0], "D1A");
  await wire(da[0] === "D1A" ? da[1] : da[0], "D1K");
  await p.click("Energize and run the test sequence");
  await sleep(400);
  q = await quiz("F3");
  check("F3 diode reversed: short named, 5 XP", q.shown && q.xp === 5 && /short/i.test(await status()), q);

  // Reload keeps the wires; phone width; reset clears.
  const n = await wires();
  await p.load();
  await p.tool(1, "1.1");
  check("reload keeps the wires", (await wires()) === n);
  await p.viewport(390, 844, true);
  check("phone width: no page overflow", await p.ev("document.documentElement.scrollWidth <= innerWidth"));
  await p.send("Emulation.clearDeviceMetricsOverride");
  await sleep(200);
  await p.reset();
  check("reset clears the schematic", (await wires()) === 0);
});
