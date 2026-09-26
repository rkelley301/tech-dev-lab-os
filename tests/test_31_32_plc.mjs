// Tools 3.1 I/O Map Inspector and 3.2 Permissive Detective.
import { run, sleep } from "./lib.mjs";

await run("3.1 + 3.2 PLC", async (p, check) => {
  const verdict = () => p.ev("[...document.querySelectorAll('main [role=status], main [aria-live=polite]')].map(v => v.textContent).join(' || ')");
  const main = () => p.text("main section");

  // ---- 3.1
  await p.fresh();
  await p.tool(3, "3.1");
  const K1 = "techDevLab.v3.ioMap";
  const st = () => p.ev(`JSON.parse(localStorage.getItem('${K1}'))`);
  let m = await main();
  check("3.1: badge and constructed source line", m.includes("TRAINING CONTENT") && m.includes("constructed — training scenario"));
  check("3.1: 8 chassis slots", (await p.ev("document.querySelectorAll('[aria-label=\"Chassis slots\"] button').length")) === 8);
  const slotOf = tag => p.ev(`IOM_BY_TAG[${JSON.stringify(tag)}].slot`);
  const mark = async (tag, kind) => {
    await p.click(`Slot ${await slotOf(tag)}:`);
    return p.click(`Mark ${tag} as the ${kind === "src" ? "faulted input" : "dropped output"}`);
  };
  await p.click("Inject a fault");
  let s = await st();
  const out = await p.ev(`iomUses(${JSON.stringify(s.fault)})[0].output`);
  const faultSlot = await slotOf(s.fault);
  check("3.1: faulted card shows a channel fault", (await p.ev(`[...document.querySelectorAll('[aria-label="Chassis slots"] button')].some(b => b.getAttribute('aria-label').startsWith('Slot ${faultSlot}:') && b.getAttribute('aria-label').endsWith('channel fault'))`)));
  check("3.1: rung cross-reference shows the dropped output OFF", (await main()).includes(`${out} (OFF)`), out);
  // Wrong source: a healthy input on another rung.
  const healthy = await p.ev(`IOM_CANDIDATES.find(c => c !== ${JSON.stringify(s.fault)} && iomUses(c)[0].output !== ${JSON.stringify(out)})`);
  await mark(healthy, "src");
  await mark(out, "out");
  const xp0 = await p.xpNum();
  await p.click("Check your trace");
  check("3.1: wrong trace explained", (await verdict()).includes(`${healthy} reads`) && (await verdict()).includes("healthy"), await verdict());
  await mark(s.fault, "src");
  await p.click("Check your trace");
  check("3.1: retry worth 8 XP", (await p.xpNum()) - xp0 === 8);
  await p.click("Inject a new fault");
  s = await st();
  await mark(s.fault, "src");
  await mark(await p.ev(`iomUses(${JSON.stringify(s.fault)})[0].output`), "out");
  await p.click("Check your trace");
  check("3.1: first try worth 20 XP, radar +0.5 PLC", (await p.xpNum()) - xp0 === 28 && (await p.radar()).includes("PLC 0.5"), `${(await p.xpNum()) - xp0} ${await p.radar()}`);
  // Replay a played fault: 0 XP.
  await p.ev(`(() => { const t = JSON.parse(localStorage.getItem('${K1}')); Object.assign(t, { fault: t.played[0], src: null, out: null, firstSrc: null, tries: 0, solved: false, last: null }); localStorage.setItem('${K1}', JSON.stringify(t)); return true; })()`);
  await p.load();
  await p.tool(3, "3.1");
  s = await st();
  await mark(s.fault, "src");
  await mark(await p.ev(`iomUses(${JSON.stringify(s.fault)})[0].output`), "out");
  await p.click("Check your trace");
  check("3.1: replay worth 0 XP", (await p.xpNum()) - xp0 === 28);

  // ---- 3.2
  await p.tool(3, "3.2");
  const K2 = "techDevLab.v3.permissiveDetective";
  const ss = () => p.ev(`JSON.parse(localStorage.getItem('${K2}')).session`);
  const perms = await p.ev("PERM.permissives.map(x => ({ id: x.id, fix: x.fix, brk: x.break, device: x.device, delay: x.delayMs || 0 }))");
  check("3.2: 5 permissives, badge", perms.length === 5 && (await main()).includes("TRAINING CONTENT"));
  let se = await ss();
  const key = id => String(perms.findIndex(x => x.id === id) + 1);
  const notBlocked = perms.find(x => !se.blocked.includes(x.id)).id;
  const xp1 = await p.xpNum();
  await p.blur();
  await p.key(key(notBlocked));
  await p.key("Enter");
  check("3.2: wrong diagnosis names the true contact", (await verdict()).includes("Marked open but actually true"), await verdict());
  await p.key(key(notBlocked));
  for (const b of se.blocked) await p.key(key(b));
  await p.key("Enter");
  check("3.2: retry worth 8 XP", (await p.xpNum()) - xp1 === 8, String((await p.xpNum()) - xp1));
  // Fix the field: operate each blocked device, waiting out the lube delay.
  const longest = Math.max(0, ...perms.filter(x => se.blocked.includes(x.id)).map(x => x.delay));
  for (const b of se.blocked) {
    const x = perms.find(y => y.id === b);
    await p.click(`${x.fix}: ${x.device}`);
  }
  await sleep(longest + 800);
  se = await ss();
  check("3.2: all permissives made after the lube delay", Object.values(se.good).every(Boolean), se.good);
  const forced = perms[1];
  await p.click(`${forced.brk}: ${forced.device}`);
  check("3.2: forcing one open drops it", (await ss()).good[forced.id] === false);
  // A new session whose open-contact set has not been played yet (played key: sorted ids joined by +).
  for (let i = 0; i < 20; i++) {
    await p.click("Start a new session");
    se = await ss();
    const played = await p.ev(`JSON.parse(localStorage.getItem('${K2}')).played`);
    if (!played.includes([...se.blocked].sort().join("+"))) break;
  }
  await p.blur();
  for (const b of se.blocked) await p.key(key(b));
  await p.key("Enter");
  check("3.2: new session diagnosed first try: 20 XP, radar PLC +0.5", (await p.xpNum()) - xp1 === 28 && (await p.radar()).includes("PLC 1"), `${(await p.xpNum()) - xp1} ${await p.radar()}`);

  const notes = await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.fieldNotes') || '[]').map(n => n.tool)");
  check("Field Notes from 3.1 and 3.2", notes.includes("3.1") && notes.includes("3.2"), notes);
  await p.viewport(390, 844, true);
  check("phone width: no overflow on 3.2", await p.ev("document.documentElement.scrollWidth <= innerWidth"));
  await p.send("Emulation.clearDeviceMetricsOverride");
  await sleep(200);
  await p.reset();
  const left = await p.ev("['ioMap', 'permissiveDetective'].map(k => JSON.parse(localStorage.getItem('techDevLab.v3.' + k) || '{}').played || []).map(a => a.length)");
  check("reset clears 3.1 and 3.2", left.every(n => n === 0), left);
});
