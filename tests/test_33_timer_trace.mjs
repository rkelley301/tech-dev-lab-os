// Tool 3.3 Timer Trace.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run, sleep } from "./lib.mjs";

const spec = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "sources", "timer-trace-spec.md"), "utf8");
const norm = s => s.replace(/\s+/g, " ").trim();
// The four region bullets, joined across their wrapped lines.
const specRegions = spec.split("State regions:")[1].split("Constraints:")[0].split(/\n- /).slice(1).map(norm);

await run("3.3 Timer Trace", async (p, check) => {
  await p.fresh();
  await p.tool(3, "3.3");
  const bits = () => p.ev("[...document.querySelectorAll('main section[aria-labelledby=\"tt-sim\"] [aria-live=off] > div')].map(d => d.lastChild.textContent)");
  const log = () => p.ev("[...document.querySelectorAll('ol[aria-label=\"Transition log\"] li')].map(li => [...li.children].map(c => c.textContent))");
  const setPre = async v => {
    await p.ev(`(() => { const i = document.querySelector('input[type=number]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, ${JSON.stringify(String(v))}); i.dispatchEvent(new Event('input', { bubbles: true })); i.focus(); i.blur(); return true; })()`);
    await sleep(150);
    return p.ev("document.querySelector('input[type=number]').value");
  };
  const verdict = () => p.ev("[...document.querySelectorAll('main [role=status]')].map(v => v.textContent).join(' || ')");

  // Region text is the spec's, word for word.
  const shownRegions = await p.ev("TTR.regions.map(r => r.text)");
  check("regions match the spec", JSON.stringify(shownRegions.map(norm)) === JSON.stringify(specRegions), { shownRegions, specRegions });
  const m = await p.text("main section");
  check("badge, 1756-RM018 cited, constructed line", m.includes("TRAINING CONTENT") && m.includes("1756-RM018") && !m.includes("RM003") && m.includes("constructed — training scenario"));
  let b = await bits();
  check("idle: all bits 0, ACC 0, PRE 2000", JSON.stringify(b.slice(0, 4)) === '["0","0","0","0"]' && b[4] === "0 ms / 2000 ms", b);

  // PRE limits.
  check("PRE clamps low to 500", (await setPre(50)) === "500");
  check("PRE clamps high to 10000", (await setPre(20000)) === "10000");
  check("PRE takes 500", (await setPre(500)) === "500");

  // Run to done, sampling the readout.
  await p.click("Run: rung input true");
  const samples = [];
  for (let i = 0; i < 30; i++) { samples.push(await bits()); await sleep(40); }
  const bad = samples.filter(s => {
    const [rung, en, tt, dn, acc] = s;
    const accNum = /^(\d+) ms/.test(acc) ? Number(acc.match(/^(\d+)/)[1]) : null;
    return (dn === "1" && accNum !== null) || (tt === "1" && dn === "1") || (accNum !== null && accNum >= 500) || (dn === "1" && !acc.startsWith("≥ PRE")) || rung !== "1" || en !== "1";
  });
  check("no sample shows DN before PRE, TT with DN, or ACC at PRE", bad.length === 0, bad.slice(0, 3));
  check("timing samples seen, then done", samples.some(s => s[2] === "1" && s[3] === "0") && samples.at(-1)[3] === "1" && samples.at(-1)[2] === "0", samples.at(-1));
  let L = await log();
  const tTiming = Number(L.find(r => r[2].startsWith("RUNG_IN = 1 and ACC < PRE"))[1].split(" ")[0]);
  const tDone = Number(L.find(r => r[2].startsWith("RUNG_IN = 1 and ACC >= PRE"))[1].split(" ")[0]);
  check("done transition exactly PRE after rung true", tDone - tTiming === 500, `${tTiming} -> ${tDone}`);
  const edges = await p.ev(`(() => {
    const paths = [...document.querySelectorAll('svg[aria-label^="Timing chart"] path')].map(pa => pa.getAttribute('d'));
    const pts = d => d.replace(/^M /, '').split(' L ').map(s => s.split(' ').map(Number));
    const rise = d => { const q = pts(d); for (let i = 1; i < q.length; i++) if (q[i][0] === q[i - 1][0] && q[i][1] < q[i - 1][1]) return q[i][0]; return null; };
    const fall = d => { const q = pts(d); for (let i = 1; i < q.length; i++) if (q[i][0] === q[i - 1][0] && q[i][1] > q[i - 1][1]) return q[i][0]; return null; };
    return { ttRise: rise(paths[2]), ttFall: fall(paths[2]), dnRise: rise(paths[3]), enRise: rise(paths[1]), rungRise: rise(paths[0]) };
  })()`);
  check("chart: TT falls where DN rises; EN, TT, Rung rise together", edges.ttFall !== null && edges.ttFall === edges.dnRise && edges.enRise === edges.ttRise && edges.rungRise === edges.enRise, edges);
  check("PRE locked while the rung is true", await p.ev("document.querySelector('input[type=number]').disabled"));

  // Drop: all zero, ACC reset, logged.
  await p.click("Drop the rung");
  b = await bits();
  L = await log();
  check("drop: bits 0, ACC 0, region logged", JSON.stringify(b.slice(0, 4)) === '["0","0","0","0"]' && b[4].startsWith("0 ms") && L[0][2].startsWith("RUNG_IN transitions to 0"), { b, L0: L[0] });

  // Pause holds the clock; a mid-timing drop resets (not retentive).
  await setPre(3000);
  await p.click("Run: rung input true");
  await sleep(400);
  await p.click("Pause the clock");
  const a1 = (await bits())[4];
  await sleep(400);
  const a2 = (await bits())[4];
  check("pause holds ACC", a1 === a2 && /^\d+ ms/.test(a1), `${a1} / ${a2}`);
  await p.click("Resume the clock");
  await sleep(300);
  const a3 = Number((await bits())[4].match(/^\d+/)[0]);
  check("resume continues from the held ACC", a3 > Number(a1.match(/^\d+/)[0]), `${a1} -> ${a3}`);
  await p.click("Drop the rung");
  await sleep(300);
  await p.click("Run: rung input true");
  await sleep(60);
  const a4 = Number((await bits())[4].match(/^\d+/)[0]);
  L = await log();
  const tDrop = Number(L.find(r => r[2].startsWith("RUNG_IN transitions to 0"))[1].split(" ")[0]);
  const tRerun = Number(L.find(r => r[2].startsWith("RUNG_IN = 1 and ACC < PRE"))[1].split(" ")[0]);
  check("time passes while the rung is low", tRerun - tDrop >= 200, `${tDrop} -> ${tRerun}`);
  check("after a mid-timing drop, ACC starts over (no RTO)", a4 < a3, `${a3} then ${a4}`);
  await p.click("Drop the rung");

  // Quiz.
  const xp0 = await p.xpNum();
  await p.blur();
  check("q1 shown", (await p.text("#tt-q")).includes("The rung goes true."));
  await p.key("1");
  await p.key("2");
  await p.key("Enter");
  check("q1 first try: 20 XP, radar PLC 0.5", (await p.xpNum()) - xp0 === 20 && (await p.radar()).includes("PLC 0.5"), `${(await p.xpNum()) - xp0} ${await p.radar()}`);
  check("q1 answer cites the timing region", (await verdict()).includes("RUNG_IN = 1 and ACC < PRE") && (await verdict()).includes("1756-RM018"));
  await p.key("Enter");
  await p.key("Enter");
  check("q2 (stays timing) first try", (await p.xpNum()) - xp0 === 40);
  await p.key("Enter");
  check("q3 asks about ACC reaching PRE", (await p.text("#tt-q")).includes("ACC reaches PRE (ACC ≥ PRE)"));
  await p.key("Enter");
  check("q3 wrong: 2 of 3, no answer given", (await verdict()).includes("2 of 3 wrong.") && !(await verdict()).includes("ACC >= PRE: EN"), await verdict());
  await p.key("2");
  await p.key("3");
  await p.key("Enter");
  check("q3 retry: 8 XP, done region", (await p.xpNum()) - xp0 === 48 && (await verdict()).includes("EN 1 · TT 0 · DN 1"), await verdict());
  // Answers for all six follow the spec regions.
  const answers = await p.ev("TTR.quiz.items.map(i => i.id + ':' + ['en','tt','dn'].map(k => ttBits(i.region)[k]).join(''))");
  check("quiz answers: q1 110, q2 110, q3 101, q4 101, q5 000, q6 000", answers.join(",") === "q1:110,q2:110,q3:101,q4:101,q5:000,q6:000", answers);
  const notes = await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.fieldNotes') || '[]').filter(n => n.tool === '3.3').length");
  check("field notes for 3 solved questions", notes === 3, String(notes));

  // Reload persists quiz progress and PRE; reset clears; phone width.
  await p.load();
  await p.tool(3, "3.3");
  check("reload keeps SOLVED 3 / 6 and PRE 3000", (await p.text("main section")).includes("SOLVED 3 / 6") && (await p.ev("document.querySelector('input[type=number]').value")) === "3000");
  await p.viewport(390, 844, true);
  check("phone width: no horizontal overflow", await p.ev("document.documentElement.scrollWidth <= innerWidth"));
  await p.send("Emulation.clearDeviceMetricsOverride");
  await sleep(200);
  await p.reset();
  check("reset clears the quiz", (await p.ev("(JSON.parse(localStorage.getItem('techDevLab.v3.timerTrace') || '{}').played || []).length")) === 0);
});
