// Tools 2.2 Scaling Bench, 2.3 Cal Record Builder, 2.4 Split-Half Isolator.
import { run, sleep } from "./lib.mjs";

await run("2.2 + 2.3 + 2.4 instrumentation", async (p, check) => {
  const setVal = (sel, v, proto = "HTMLInputElement") => p.ev(`(() => { const i = document.querySelector(${JSON.stringify(sel)}); if (!i) return null; Object.getOwnPropertyDescriptor(${proto}.prototype, 'value').set.call(i, ${JSON.stringify(String(v))}); i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); return i.value; })()`);
  const verdict = () => p.ev("[...document.querySelectorAll('main [role=status]')].map(v => v.textContent).join(' || ')");
  const main = () => p.text("main section");

  // ---- 2.2 Scaling Bench
  await p.fresh();
  await p.tool(2, "2.2");
  await setVal('input[aria-label="Loop current in milliamps"]', 16);
  await sleep(150);
  let m = await main();
  check("2.2: 16 mA reads 75.00 % on 0-100", m.includes("75.00 %") && m.includes("Start Here C10"), m.slice(0, 200));
  await p.click("Reverse acting");
  m = await main();
  check("2.2: reverse acting labeled derived", /derived/i.test(m) && m.includes("25.00 %"), "");
  await p.click("Reverse acting");
  const SB = "techDevLab.v3.scalingBench";
  const want = () => p.ev(`(() => { const t = JSON.parse(localStorage.getItem('${SB}')); const c = t.deck[t.pos]; return +(4 + 0.16 * c.pct).toFixed(2); })()`);
  let w = await want();
  const xp0 = await p.xpNum();
  await setVal('input[aria-label="Your answer in milliamps"]', (w + 0.5).toFixed(2));
  await p.click("Check answer");
  check("2.2: wrong answer shows the work", (await verdict()).includes("Off by 0.50 mA") && (await verdict()).includes("I = 4 + 16 x (EU - LRV) / (URV - LRV)"), await verdict());
  await setVal('input[aria-label="Your answer in milliamps"]', w.toFixed(2));
  await p.click("Check answer");
  check("2.2: retry worth 5 XP", (await p.xpNum()) - xp0 === 5);
  await p.click("Next challenge");
  w = await want();
  await setVal('input[aria-label="Your answer in milliamps"]', w.toFixed(2));
  // Enter checks from the answer field.
  await p.ev("document.querySelector('input[aria-label=\"Your answer in milliamps\"]').focus(); true");
  await p.key("Enter");
  check("2.2: first try (Enter) worth 15 XP, radar 0.4", (await p.xpNum()) - xp0 === 20 && (await p.radar()).includes("Instrumentation 0.4"), `${(await p.xpNum()) - xp0} ${await p.radar()}`);
  check("2.2: 15 Check Mode ranges from p.16", (await p.ev("LRV_URV.items.length")) === 15 && (await p.ev("LRV_URV.source")).includes("p.16"));

  // ---- 2.3 Cal Record Builder: PT-101, the sheet's example.
  await p.tool(2, "2.3");
  await p.click("Scenario PT-101");
  const applyNext = () => p.ev("(() => { const b = [...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label') || '').startsWith('Apply test point') && !(b.getAttribute('aria-label') || '').includes('recorded') && !b.disabled); if (!b) return false; b.click(); return true; })()");
  let points = 0;
  for (let i = 0; i < 7; i++) {
    if (!(await applyNext())) break;
    await sleep(1100);
    if (await p.click("Record as-found reading")) points++;
  }
  check("2.3: 7 points recorded after settling", points === 7, String(points));
  m = await main();
  check("2.3: error table with PASS / FAIL and hysteresis", /PASS|FAIL/.test(m) && /hysteresis/i.test(m), "");
  const xp1 = await p.xpNum();
  const pickAct = act => p.ev(`(() => { const b = [...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label') || '').startsWith('Option') && (b.getAttribute('aria-label') || '').includes(${JSON.stringify(act)})); if (!b) return false; b.click(); return true; })()`);
  await pickAct("Span trim");
  await sleep(150);
  check("2.3: PT-101 Span trim first try: 25 XP, radar +0.6", (await p.xpNum()) - xp1 === 25 && (await p.radar()).includes("Instrumentation 1,"), `${(await p.xpNum()) - xp1} ${await p.radar()}`);
  // Printable Form 5: capture window.open.
  await p.ev("window.__printed = ''; window.open = () => ({ document: { write: h => { window.__printed += h; }, close() {}, open() {} }, focus() {}, print() {}, close() {} }); true");
  await p.click("Print the Form 5 calibration record");
  const printed = await p.ev("window.__printed");
  check("2.3: Form 5 record prints with the PT-101 tag", printed.includes("PT-101") && /As-Found/i.test(printed), printed.slice(0, 120));
  // Destroy the evidence on TT-205.
  await p.click("Scenario TT-205");
  await p.click("Zero trim");
  check("2.3: trim before recording destroys the evidence", (await verdict()).includes("You just destroyed the evidence."), await verdict());
  check("2.3: TT-205 forfeits XP", (await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.calRecord')).forfeit")).length === 1);

  // ---- 2.4 Split-Half Isolator
  await p.tool(2, "2.4");
  const SH = "techDevLab.v3.splitHalf";
  const r = () => p.ev(`JSON.parse(localStorage.getItem('${SH}')).round`);
  const scen = async () => p.ev(`SPH_SCENARIOS[JSON.parse(localStorage.getItem('${SH}')).round.idx]`);
  let s = await scen();
  check("2.4: scenario SH-01 FT-101, source cited", s.id === "SH-01" && (await main()).includes("FT-101"));
  const xp2 = await p.xpNum();
  await p.blur();
  await p.key("4");
  await p.key("2");
  check("2.4: two probes logged with cut quality", (await r()).probes.length === 2 && (await main()).includes("Cut Quality"), "");
  const wrongLink = await p.ev(`CHAIN[${s.faultLink === 0 ? 1 : 0}]`);
  await p.click(`Fault at ${wrongLink}`);
  await p.click("Confirm fault location");
  check("2.4: wrong guess is non-punitive with a retry", (await r()).outcome && !(await r()).outcome.correct && (await p.click("Retry this scenario")), "");
  await p.blur();
  await p.key("4");
  await p.key("2");
  await p.click(`Fault at ${s.faultLinkName}`);
  await p.click("Confirm fault location");
  check("2.4: retry worth 10 XP", (await p.xpNum()) - xp2 === 10, String((await p.xpNum()) - xp2));
  await p.click("Next scenario");
  s = await scen();
  await p.blur();
  await p.key("4");
  await p.key("2");
  await p.click(`Fault at ${s.faultLinkName}`);
  await p.click("Confirm fault location");
  check("2.4: first try worth 35 XP, radar +0.8", (await p.xpNum()) - xp2 === 45 && (await p.radar()).includes("Instrumentation 1.8"), `${(await p.xpNum()) - xp2} ${await p.radar()}`);
  // SH-05: the process really is at LRV -> STOP.
  await p.ev(`(() => { const t = JSON.parse(localStorage.getItem('${SH}')); t.round = { idx: 4, attempt: 1, lo: 0, hi: 6, probes: [], guess: null, outcome: null }; localStorage.setItem('${SH}', JSON.stringify(t)); return true; })()`);
  await p.load();
  await p.tool(2, "2.4");
  s = await scen();
  await p.blur();
  await p.key("1");
  const stopShown = await p.click("Stop: this is not an instrumentation fault");
  check("2.4: SH-05 process fault answered with STOP", s.isProcessFault && stopShown && (await r()).outcome && (await r()).outcome.correct, JSON.stringify(await r()).slice(0, 120));
  const notes = await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.fieldNotes') || '[]').map(n => n.tool)");
  check("Field Notes from 2.2, 2.3, 2.4", ["2.2", "2.3", "2.4"].every(x => notes.includes(x)), notes);

  // Reset clears all three.
  await p.reset();
  const left = await p.ev("['scalingBench', 'calRecord', 'splitHalf'].map(k => localStorage.getItem('techDevLab.v3.' + k)).map(v => v ? JSON.parse(v) : null).map(v => v ? (v.played || []).length : 0)");
  check("reset clears 2.2, 2.3, 2.4 progress", left.every(n => n === 0), left);
});
