// Tool 1.2 Sourcing or Sinking?
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run, sleep, FILE } from "./lib.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LIB = JSON.parse(fs.readFileSync(path.join(HERE, "..", "output", "content-library.json"), "utf8"));
const HTML = fs.readFileSync(FILE, "utf8");

// Transcribed from the rendered pages (renderer rule 8 guard): 1734-IN051 p.9
// Table 2 and p.12 Figure 6 / specifications; 1734-IN052 p.10 table after
// Figure 4, p.12 Figure 8, p.13 specifications.
const TABLE = [[0, 0, 4, 6], [1, 1, 5, 7], [2, 2, 4, 6], [3, 3, 5, 7]];
const EXPECT = {
  "1734-IB4": { topology: "sinking", marking: "24VDC Sink Input", pub: "Rockwell 1734-IN051" },
  "1734-IV4": { topology: "sourcing", marking: "24VDC Source Input", pub: "Rockwell 1734-IN052" },
};

await run("1.2 Sourcing or Sinking?", async (p, check) => {
  // Source data.
  for (const m of LIB.pointIO.modules) {
    const e = EXPECT[m.module];
    const rows = m.channels.map(c => [c.channel, c.input_terminal, c.common_terminal, c.supply_terminal]);
    check(`${m.module}: terminals, V/C, on-state, marking, topology match the Rockwell pages`,
      e && JSON.stringify(rows) === JSON.stringify(TABLE) && JSON.stringify(m.power.field_positive_terminal) === "[6,7]" && JSON.stringify(m.power.field_common_terminal) === "[4,5]" &&
      m.power.on_state_min === "10V DC" && m.power.on_state_max === "28.8V DC" && m.module_marking === e.marking && m.input_topology === e.topology && m.source_publication === e.pub, m);
  }
  check("NC conflict recorded as UNSPECIFIED", LIB.pointIO.source_conflicts?.[0]?.resolution === "UNSPECIFIED — DO NOT INFER", LIB.pointIO.source_conflicts);
  const ss = LIB.sourcingSinking;
  check("constructed parts flagged, trap and teaching point sourced",
    ["leads", "sensors", "challenges", "outcomes", "paths"].every(k => ss[k].constructed === true) && ss.trap.constructed === false && ss.trap.source === "Field Learning Plan.pdf p.10" && ss.teachingPoint.source.startsWith("User-provided spec"));

  // Rule 9: no module-specific code in the tool.
  const code = HTML.slice(HTML.indexOf("Tool 1.2: Sourcing or Sinking?"), HTML.indexOf("Tool 1.3: Contact Logic Puzzle"));
  check("tool code names no module (one renderer, no IB4/IV4 fork)", code.length > 1000 && !/IB4|IV4|IN051|IN052/.test(code), (code.match(/.{30}(IB4|IV4|IN05[12]).{30}/) || [""])[0]);

  await p.fresh();
  const embedded = await p.ev("JSON.stringify({ pointIO: POINT_IO, ss: SSK })");
  check("embedded POINT_IO and SSK equal content-library.json", embedded === JSON.stringify({ pointIO: LIB.pointIO, ss: LIB.sourcingSinking }));

  // Logic: every landing on every wire challenge, one OK, equal to the table landing.
  const en = await p.ev(`(() => {
    const out = {};
    for (const ch of SS_CH.filter(c => c.kind === 'wire')) {
      const mod = ssModule(ch.module), sensor = SS_SENSOR[ch.sensor];
      const T = ssTerminals(mod).map(t => t.n);
      let n = 0, ok = [], unknown = 0;
      for (const pos of T) for (const o of T) for (const neg of T) {
        n++;
        const r = ssCheck(mod, sensor, ch.channel, { pos, out: o, neg });
        if (!SS_OUT[r.id]) unknown++;
        if (r.id === 'ok') ok.push([pos, o, neg]);
      }
      const row = mod.channels.find(c => c.channel === ch.channel);
      out[ch.id] = { n, ok, unknown, want: [row.supply_terminal, row.input_terminal, row.common_terminal] };
    }
    const ib4 = ssModule('1734-IB4'), iv4 = ssModule('1734-IV4');
    out.pnpIV4 = ssCheck(iv4, SS_SENSOR.pnp, 0, ssTableLanding(iv4, 0)).id;
    out.npnIB4 = ssCheck(ib4, SS_SENSOR.npn, 0, ssTableLanding(ib4, 0)).id;
    out.pnpIB4 = ssCheck(ib4, SS_SENSOR.pnp, 0, ssTableLanding(ib4, 0)).id;
    out.npnIV4 = ssCheck(iv4, SS_SENSOR.npn, 0, ssTableLanding(iv4, 0)).id;
    out.valid = [ssValidate(ib4, 'x'), ssValidate(iv4, 'x')];
    out.missing = ssValidate(ssModule('1734-IB8'), '1734-IB8');
    const broken = JSON.parse(JSON.stringify(ib4));
    broken.channels[1].input_terminal = 'UNSPECIFIED — DO NOT INFER';
    broken.channels[2].common_terminal = 7;
    out.broken = ssValidate(broken, 'x');
    out.pathSink = ssPath(ib4, 2).steps.join(' > ');
    out.pathSource = ssPath(iv4, 3).steps.join(' > ');
    return out;
  })()`);
  for (const id of ["ss-1", "ss-2"]) {
    const r = en[id];
    check(`${id}: ${r.n} landings, exactly one OK, the Rockwell table landing`, r.n === 512 && r.ok.length === 1 && JSON.stringify(r.ok[0]) === JSON.stringify(r.want) && r.unknown === 0, r);
  }
  check("wrong pairing never completes; right pairing does", en.pnpIV4 === "pnpOnSourcing" && en.npnIB4 === "npnOnSinking" && en.pnpIB4 === "ok" && en.npnIV4 === "ok", en);
  check("both modules validate", en.valid.every(v => v.length === 0), en.valid);
  check("rule 9/10: missing module and broken channels fail loudly", en.missing.length === 1 && en.broken.length === 2, [en.missing, en.broken]);
  check("current path follows topology: sinking current in, sourcing current out",
    en.pathSink.includes("IN 2, terminal 2 (current in) > Sinking input circuit") && en.pathSource.startsWith("+24 VDC > Sourcing input circuit > IN 3, terminal 3 (current out)"), en);

  await p.tool(1, "1.2");
  const main = () => p.text("main section[aria-label^='Tool 1.2']");
  const verdict = () => p.ev("[...document.querySelectorAll('main [role=status]')].map(v => v.textContent).join(' || ')");
  const setSel = (label, v) => p.ev(`(() => { const s = document.querySelector('main select[aria-label=${JSON.stringify(label)}]'); if (!s) return null; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, ${JSON.stringify(v)}); s.dispatchEvent(new Event('change', { bubbles: true })); return s.value; })()`);
  const land = async (pos, out, neg) => { await setSel("Lead +V: terminal", String(pos)); await setSel("Lead OUT: terminal", String(out)); await setSel("Lead 0V: terminal", String(neg)); await sleep(100); };
  const leds = () => p.ev("[...document.querySelectorAll('main [aria-label^=\"Input \"][role=listitem]')].map(e => e.getAttribute('aria-label')).join(',')");
  const pathTxt = () => p.ev("[...document.querySelectorAll('main ol[aria-label^=\"Current path\"] li')].map(l => l.getAttribute('aria-label')).join(' | ')");

  let m = await main();
  check("badge, challenge 1, module hidden until the sensor is typed", m.includes("TRAINING CONTENT") && m.includes("CHALLENGE 1 / 3") && m.includes("1734-IB4 with a PNP sensor") && !m.includes("24VDC Sink Input"), m.slice(0, 200));
  const footer = await p.ev("(() => { const t = document.querySelector('main section[aria-label^=\"Tool 1.2\"]').textContent; return t.slice(t.lastIndexOf('SOURCE')); })()");
  check("footer cites 1734-IN051 and 1734-IN052 with page and figure, FLP p.10, user spec",
    footer.includes("1734-IN051") && footer.includes("p.9 Figure 5 and Table 2") && footer.includes("1734-IN052") && footer.includes("p.9 Figure 4") && footer.includes("p.10") && footer.includes("Field Learning Plan.pdf p.10") && footer.includes("user-provided spec"), footer);
  check("ribbon lights 3. Check signal path", await p.ev("!!document.querySelector('[aria-current=step]') && document.querySelector('[aria-current=step]').textContent.includes('Check signal path')"));

  await p.blur();
  await p.key("2");
  check("NPN on a PNP sensor: miss, retry XP stated", (await verdict()).includes("Not NPN.") && (await verdict()).includes("8 XP"), await verdict());
  await p.key("1");
  await p.key("2");
  check("sourcing on the IB4: miss quotes the marking and cites p.12 Figure 6", (await verdict()).includes('"24VDC Sink Input"') && (await verdict()).includes("1734-IN051 p.12, Figure 6"), await verdict());
  await p.key("1");
  m = await main();
  check("module face drawn from JSON: 8 terminals, V +24 VDC, DC COM, 4 LEDs",
    (await p.ev("document.querySelectorAll('main button[aria-label^=\"Terminal \"]').length")) === 8 && m.includes("+24 VDC") && m.includes("DC COM") && m.includes("V = +24 VDC (terminals 6, 7)") && m.includes("C = DC common (terminals 4, 5)") && (await leds()) === "Input 0 off,Input 1 off,Input 2 off,Input 3 off", m.slice(0, 600));
  check("no NC definition shown (source conflict)", !/\bNC\b|Normally closed|No connection/.test(m));
  check("never 'PNP good / NPN bad'", !/PNP[^.]*\b(better|good|preferred|correct choice)\b|NPN[^.]*\b(bad|worse|wrong type)\b/i.test(m));

  // Miswires.
  await land(4, 2, 6);
  await p.click("Check the wiring");
  check("supply reversed: sensor not powered", (await verdict()).includes("Sensor not powered.") && (await verdict()).includes("DC common (C)"), await verdict());
  await land(6, 5, 4);
  await p.click("Check the wiring");
  check("OUT on C: no input in the path", (await verdict()).includes("OUT is not on an input.") && (await verdict()).includes("terminal 5, a DC common (C) terminal"), await verdict());
  await land(7, 2, 4);
  await p.click("Check the wiring");
  check("V on 7 for channel 2: table mismatch cites Table 2, no path drawn", (await verdict()).includes("assigns channel 2 supply to terminal 6") && (await verdict()).includes("Table 2") && (await pathTxt()) === "", await verdict());
  await land(7, 3, 5);
  await p.click("Check the wiring");
  check("channel 3 landing: wrong channel, input 3 lit alone", (await verdict()).includes("input 3 turns on") && (await leds()) === "Input 0 off,Input 1 off,Input 2 off,Input 3 on", await leds());

  // Drag and drop plus click-to-land, then check: retry XP.
  const xp0 = await p.xpNum();
  await land("", "", "");
  const drop = (lead, n) => p.ev(`(() => { const dt = new DataTransfer(); dt.setData('text/plain', 'lead:${lead}'); const b = document.querySelector('main button[aria-label^="Terminal ${n},"]'); b.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true })); return true; })()`);
  await drop("pos", 6);
  await drop("out", 2);
  await sleep(100);
  await p.click("Lead 0V");
  await p.ev("document.querySelector('main button[aria-label^=\"Terminal 4,\"]').click(); true");
  await sleep(100);
  check("drag and click landed the leads", (await p.ev("[...document.querySelectorAll('main select')].map(s => s.value).join(',')")) === "6,2,4");
  await p.blur();
  await p.key("Enter");
  const v = await verdict();
  check("path complete after misses, teaching point with user spec", v.includes("Current path complete after") && v.includes("PNP output → sinking PLC input. NPN output → sourcing PLC input.") && v.includes("User-provided spec") && v.includes("Neither output type is better"), v.slice(0, 300));
  check("retry worth 8 XP", (await p.xpNum()) - xp0 === 8, `${xp0} -> ${await p.xpNum()}`);
  check("only input 2 on; path runs current in at terminal 2", (await leds()) === "Input 0 off,Input 1 off,Input 2 on,Input 3 off" && (await pathTxt()).includes("IN 2, terminal 2 (current in): current"), await pathTxt());
  check("radar unchanged after a retry", (await p.radar()).includes("Electrical 0,"), await p.radar());

  // Challenge 2 first try: IV4 + NPN on channel 3.
  await p.key("Enter");
  const xp1 = await p.xpNum();
  await p.key("2");
  await p.key("2");
  m = await main();
  check("challenge 2: IV4 face reads 24VDC Source Input", m.includes("CHALLENGE 2 / 3") && m.includes("24VDC Source Input"), m.slice(0, 300));
  await land(7, 3, 5);
  await p.blur();
  await p.key("Enter");
  check("IV4 + NPN first try: 20 XP", (await p.xpNum()) - xp1 === 20 && (await verdict()).includes("first try"), `${xp1} -> ${await p.xpNum()}`);
  check("sourcing path: current out of terminal 3, through sensor 0V to C 5", (await pathTxt()).includes("IN 3, terminal 3 (current out)") && (await pathTxt()).includes("C terminal 5"), await pathTxt());
  check("radar +0.5 electrical", (await p.radar()).includes("Electrical 0.5"), await p.radar());

  // Challenge 3: pairing.
  await p.click("Next challenge");
  m = await main();
  check("challenge 3: both modules, pre-wired to input 0", m.includes("Matching pairs") && m.includes("1734-IB4") && m.includes("1734-IV4") && m.includes("pre-wired to input 0"), m.slice(0, 300));
  const xp2 = await p.xpNum();
  await setSel("3-wire proximity switch, sensor A: module", "1734-IV4");
  await sleep(100);
  check("select pairs the other sensor automatically", (await p.ev("[...document.querySelectorAll('main select')].map(s => s.value).join(',')")) === "1734-IV4,1734-IB4");
  await p.blur();
  await p.key("Enter");
  const vw = await verdict();
  const blocked = await p.ev("document.querySelector('main').textContent.split('NO CURRENT: THE PATH DOES NOT COMPLETE').length - 1");
  check("wrong pairing: both paths blocked, trap 6 cited", vw.includes("Current path does not complete.") && vw.includes("PNP output switches OUT to +V") && vw.includes("NPN output switches OUT to 0V") && vw.includes("Field Learning Plan.pdf p.10") && blocked === 2, { blocked, flp: vw.includes("Field Learning Plan.pdf p.10"), npn: vw.includes("NPN output switches OUT to 0V") });
  check("wrong pairing draws no path naming a switch type", !(await pathTxt()).includes("output switch"), await pathTxt());
  check("no LED lit on a wrong pairing", !(await leds()).includes(" on"), await leds());
  // Drag sensor A onto the IB4 face.
  await p.ev(`(() => { const dt = new DataTransfer(); dt.setData('text/plain', 'sensor:pnp'); const f = document.querySelector('main figure[aria-label^="1734-IB4"]'); f.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true })); return true; })()`);
  await sleep(100);
  await p.click("Check the pairing");
  check("right pairing: both paths complete, 8 XP", (await verdict()).includes("Both paths complete after 1 miss") && (await p.xpNum()) - xp2 === 8 && (await leds()) === "Input 0 on,Input 1 off,Input 2 off,Input 3 off,Input 0 on,Input 1 off,Input 2 off,Input 3 off", await leds());

  // Replay: 0 XP.
  await p.key("Enter");
  const xp3 = await p.xpNum();
  await p.key("1");
  await p.key("1");
  await land(6, 2, 4);
  await p.blur();
  await p.key("Enter");
  check("replay worth 0 XP", (await p.xpNum()) === xp3);

  const notes = await p.ev("(JSON.parse(localStorage.getItem('techDevLab.v3.fieldNotes') || '[]')).filter(n => n.tool === '1.2').length");
  check("Field Notes line per completion", notes === 4, notes);
  check("log lists completions", (await main()).includes("Wiring log") && (await main()).includes("1734-IV4 with an NPN sensor"));

  // Validation halt: break the IB4 object in place, re-open the tool.
  await p.ev("window.__ib4 = JSON.stringify(POINT_IO.modules[0]); POINT_IO.modules[0].channels[0].input_terminal = 'UNSPECIFIED — DO NOT INFER'; true");
  await p.tool(1, "1.3");
  await p.tool(1, "1.2");
  const halt = await p.ev("(document.querySelector('main [role=alert]') || {}).textContent || ''");
  check("broken module definition stops the tool, no diagram", halt.includes("failed validation") && halt.includes("Channel 0: input_terminal") && (await p.ev("document.querySelectorAll('main button[aria-label^=\"Terminal \"]').length")) === 0, halt);
  await p.load();

  // Persistence and reset.
  await p.tool(1, "1.2");
  check("reload keeps progress", (await main()).includes("CLEARED 3 / 3"));
  await p.reset();
  check("reset clears the key", (await p.ev("localStorage.getItem('techDevLab.v3.sourcingSinking')")) === null || (await main()).includes("CLEARED 0 / 3"));

  // Phone width.
  await p.viewport(390, 844, true);
  await p.tool(1, "1.2");
  await p.key("1"); await p.key("1");
  check("390 px: no horizontal overflow", !(await p.ev("document.documentElement.scrollWidth > innerWidth")));
  const small = await p.ev("[...document.querySelectorAll('main section[aria-label^=\"Tool 1.2\"] button, main section[aria-label^=\"Tool 1.2\"] select')].filter(b => b.offsetParent && b.getBoundingClientRect().height < 44).map(b => b.getAttribute('aria-label')).slice(0, 5)");
  check("touch targets at least 44 px", small.length === 0, small);
});
