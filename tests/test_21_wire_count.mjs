// Tool 2.1 Wire Count Detective.
import { run, sleep } from "./lib.mjs";

await run("2.1 Wire Count Detective", async (p, check) => {
  await p.fresh();
  await p.tool(2, "2.1");
  const main = () => p.text("main section");
  const setSel = (i, v) => p.ev(`(() => { const s = document.querySelectorAll('main select')[${i}]; if (!s) return null; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, ${JSON.stringify(v)}); s.dispatchEvent(new Event('change', { bubbles: true })); return s.value; })()`);
  const land = async list => { for (let i = 0; i < list.length; i++) await setSel(i, list[i]); await sleep(100); };
  const verdict = () => p.ev("[...document.querySelectorAll('main [role=status]')].map(v => v.textContent).join(' || ')");
  const chain = () => p.ev("[...document.querySelectorAll('ol[aria-label=\"Loop chain\"] li')].map(l => l.getAttribute('aria-label')).join(' | ')");

  // Every landing the selects allow: outcome ids are known, OK only for the drawn landing,
  // and only open return / missing supply carry the 0.0 mA reading.
  const enumeration = await p.ev(`(() => {
    const T = ['PWR+', 'PWR-', 'SIG+', 'SIG-', 'COM', 'OFF'];
    const res = {};
    for (const ch of WCD.challenges) {
      const ids = ch.conductors.map(c => c.id);
      let n = 0, ok = 0, bad = [], okRight = true;
      const rec = (i, as) => {
        if (i === ids.length) {
          n++;
          const r = wcCheck(ch, as);
          if (!WCD.outcomes[r.id]) bad.push(JSON.stringify(as) + '->' + r.id);
          const right = ch.conductors.every(c => as[c.id] === c.correct);
          if (r.id === 'ok') { ok++; if (!right) okRight = false; }
          else if (right) okRight = false;
          return;
        }
        for (const t of T) rec(i + 1, { ...as, [ids[i]]: t });
      };
      rec(0, {});
      res[ch.id] = { n, ok, okRight, bad: bad.slice(0, 3) };
    }
    const zero = Object.entries(WCD.outcomes).filter(([k, v]) => v && v.zeroMa).map(([k]) => k).sort().join(',');
    return { res, zero };
  })()`);
  check("wc-1: 36 landings, one OK, all outcomes known", enumeration.res["wc-1"].n === 36 && enumeration.res["wc-1"].ok === 1 && enumeration.res["wc-1"].okRight && !enumeration.res["wc-1"].bad.length, enumeration.res["wc-1"]);
  check("wc-2: 1296 landings, one OK, all outcomes known", enumeration.res["wc-2"].n === 1296 && enumeration.res["wc-2"].ok === 1 && enumeration.res["wc-2"].okRight && !enumeration.res["wc-2"].bad.length, enumeration.res["wc-2"]);
  check("wc-3: 36 landings, one OK, all outcomes known", enumeration.res["wc-3"].n === 36 && enumeration.res["wc-3"].ok === 1 && enumeration.res["wc-3"].okRight && !enumeration.res["wc-3"].bad.length, enumeration.res["wc-3"]);
  check("0.0 mA only on open return and missing supply", enumeration.zero === "missingSupply,openReturn", enumeration.zero);

  // Challenge 1: count first; the loop drawing stays closed until then.
  let m = await main();
  check("badge and source line", m.includes("TRAINING CONTENT") && m.includes("constructed — training scenario"), m.slice(0, 120));
  check("device masked before the count", m.includes("Pressure transmitter") && !m.includes("2-wire pressure transmitter") && m.includes("loop drawing opens"), m.slice(0, 300));
  await p.blur();
  await p.key("2");
  check("wrong count explained", (await verdict()).includes("4 conductors for 2 housing terminals"), await verdict());
  await p.key("1");
  m = await main();
  check("count accepted, device and loop cited", m.includes("2-wire pressure transmitter") && m.includes("p.20 (Tier 1)") && m.includes("external 24 VDC supply -> 2-wire transmitter"), m.slice(0, 400));

  // Miswires.
  await land(["SIG+", "PWR+"]);
  await p.click("Check the wiring");
  let v = await verdict();
  check("reversed transmitter polarity", v.includes("Reversed transmitter polarity.") && v.includes("4-20 mA loop with reversed transmitter polarity") && !v.includes("0.0 mA"), v);
  check("chain marks the transmitter", (await chain()).includes("Transmitter: current stops here"), await chain());

  await land(["OFF", "OFF"]);
  await p.click("Check the wiring");
  v = await verdict();
  check("missing supply shows 0.0 mA with Template Pack p.4 and FLP p.10", v.includes("Missing 24 VDC supply.") && v.includes("0.0 mA") && v.includes("Template Pack.pdf p.4") && v.includes("Field Learning Plan.pdf p.10"), v);
  check("chain marks the supply", (await chain()).includes("24 VDC supply: current stops here"), await chain());

  await land(["PWR+", "OFF"]);
  await p.click("Check the wiring");
  v = await verdict();
  check("open return conductor shows 0.0 mA", v.includes("Open return conductor.") && v.includes("0.0 mA"), v);

  await land(["PWR+", "PWR-"]);
  await p.click("Check the wiring");
  v = await verdict();
  const c1 = await chain();
  check("bypass: no mA, input marked", v.includes("Short: the input is bypassed.") && !v.includes("0.0 mA") && c1.includes("PLC analog input: no current reaches the input") && c1.includes("Transmitter: current"), c1);

  await land(["PWR+", "COM"]);
  await p.click("Check the wiring");
  v = await verdict();
  check("incorrect common termination, COM marked, no mA", v.includes("Incorrect common termination.") && !v.includes("0.0 mA") && (await chain()).includes("COM terminal: current stops here"), v);

  // Fix it: retry XP.
  const xp0 = await p.xpNum();
  await land(["PWR+", "SIG+"]);
  await p.blur();
  await p.key("Enter");
  v = await verdict();
  check("loop closed with the drill 010 fields", v.includes("Loop closed after") && v.includes("Wiring type") && v.includes("Meter the loop current at the field terminals") && v.includes("Drill Pack.pdf p.6"), v.slice(0, 200));
  check("retry worth 8 XP", (await p.xpNum()) - xp0 === 8, `${xp0} -> ${await p.xpNum()}`);
  check("current path shown on the chain", (await chain()).split("| ").every(x => x.includes(": current")), await chain());
  check("radar unchanged after a retry", (await p.radar()).includes("Instrumentation 0,"), await p.radar());

  // Challenge 2: 4-wire, first try.
  await p.key("Enter");
  m = await main();
  check("challenge 2 is the 4-wire device", m.includes("CHALLENGE 2 / 3") && m.includes("SUPPLY +"), m.slice(0, 200));
  await p.key("2");
  await land(["PWR+", "PWR-", "SIG-", "SIG+"]);
  await p.click("Check the wiring");
  check("reversed analog-input polarity", (await verdict()).includes("Reversed analog-input polarity."), await verdict());
  await p.ev("true");
  // A fresh session for a clean first try: reload, go back to challenge 2.
  await p.ev("(() => { const t = JSON.parse(localStorage.getItem('techDevLab.v3.wireCount')); t.session = { idx: 1, count: null, countMiss: null, assign: {}, checks: 0, misses: 0, firstMiss: null, result: null, done: false }; localStorage.setItem('techDevLab.v3.wireCount', JSON.stringify(t)); return true; })()");
  await p.load();
  await p.tool(2, "2.1");
  const xp1 = await p.xpNum();
  await p.blur();
  await p.key("2");
  await land(["PWR+", "PWR-", "SIG+", "SIG-"]);
  await p.click("Check the wiring");
  check("4-wire first try: 20 XP", (await p.xpNum()) - xp1 === 20, `${xp1} -> ${await p.xpNum()}`);
  check("radar +0.5 instrumentation", (await p.radar()).includes("Instrumentation 0.5"), await p.radar());

  // Challenge 3: isolator.
  await p.click("Next challenge");
  await p.key("1");
  m = await main();
  check("isolator loop cited from p.21 and p.22", m.includes("transmitter -> galvanic isolator -> PLC analog input") && m.includes("p.21") && m.includes("p.22"), m.slice(0, 300));
  await land(["PWR+", "SIG+"]);
  await p.click("Check the wiring");
  check("isolator chain closes through the isolator", (await chain()).includes("Galvanic isolator: current"), await chain());
  check("isolator first try: +20 XP, radar 1", (await p.xpNum()) - xp1 === 40 && (await p.radar()).includes("Instrumentation 1,"), `${await p.xpNum()} ${await p.radar()}`);

  // Replay: 0 XP.
  await p.click("Next challenge");
  await p.key("1");
  await land(["PWR+", "SIG+"]);
  await p.click("Check the wiring");
  check("replay worth 0 XP", (await p.xpNum()) - xp1 === 40, String(await p.xpNum()));

  // Field Notes and log.
  const notes = await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.fieldNotes') || '[]').filter(n => n.tool === '2.1')");
  check("field notes written with the p.22 model", notes.length === 4 && notes[0].text.includes("establish where the expected current stops"), notes.map(n => n.text.slice(0, 60)));
  check("wiring log rows", (await p.ev("document.querySelectorAll('main table tbody tr').length")) >= 4);

  // Reload persists, reset clears.
  await p.load();
  await p.tool(2, "2.1");
  check("progress persists", (await main()).includes("CLEARED 3 / 3"));
  await p.viewport(390, 844, true);
  check("phone width: no horizontal overflow", await p.ev("document.documentElement.scrollWidth <= innerWidth"), await p.ev("document.documentElement.scrollWidth + ' > ' + innerWidth"));
  await p.send("Emulation.clearDeviceMetricsOverride");
  await sleep(200);
  await p.reset();
  check("reset clears techDevLab.v3.wireCount", (await p.ev("localStorage.getItem('techDevLab.v3.wireCount')")) === null || (await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.wireCount')).played.length")) === 0);
});
