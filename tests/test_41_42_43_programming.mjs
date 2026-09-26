// Tools 4.1 Rung Editor, 4.2 HMI Tag Bind, 4.3 Change Control Gate.
import { run, sleep } from "./lib.mjs";

await run("4.1 + 4.2 + 4.3 programming", async (p, check) => {
  const main = () => p.text("main section");
  const setSel = (label, v) => p.ev(`(() => { const s = [...document.querySelectorAll('main select')].find(s => s.getAttribute('aria-label') === ${JSON.stringify(label)}); if (!s) return null; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, ${JSON.stringify(v)}); s.dispatchEvent(new Event('change', { bubbles: true })); return s.value; })()`);

  // ---- 4.1 Rung Editor
  await p.fresh();
  await p.tool(4, "4.1");
  const INS = { XIC: "1", XIO: "2", OTE: "3", TON: "4", OTL: "5", OTU: "6" };
  const place = async (ins, where, tag) => {
    await p.blur();
    // The palette pick toggles: press the key only if this instruction isn't already selected.
    const offered = await p.ev(`[...document.querySelectorAll('main button')].some(b => b.getAttribute('aria-label') === ${JSON.stringify(`${where}, empty: place ${ins}`)})`);
    if (!offered) await p.key(INS[ins]);
    await p.click(`${where}, empty`);
    if (tag) await setSel(`Tag for ${ins} in ${where}`, tag);
    await sleep(80);
  };
  const removeAt = async (ins, where) => p.ev(`(() => { const b = [...document.querySelectorAll('main button')].find(b => (b.getAttribute('aria-label') || '').startsWith('Remove ${ins} ') && (b.getAttribute('aria-label') || '').endsWith('from ${where}')); if (!b) return false; b.click(); return true; })()`);
  check("4.1: badge and constructed lines", (await main()).includes("TRAINING CONTENT") && (await main()).includes("constructed — training scenario"));
  // Wrong kind: an output in a condition slot is refused.
  await p.blur();
  await p.key(INS.OTE);
  await p.click("rung 0 condition slot 1, empty");
  check("4.1: output refused in a condition slot", (await main()).includes("OTE is an output."), "");
  await place("XIC", "rung 0 condition slot 1", "CONV_START");
  await place("XIC", "rung 0 condition slot 2", "ESTOP_OK");
  await place("OTL", "rung 0 output slot", "CONV_RUN");
  const xp0 = await p.xpNum();
  await p.click("Test the rung against the goal");
  check("4.1: OTL never unlatched gets its hint", /OTL/.test(await main()) && /unlatch/i.test(await main()), "");
  await removeAt("OTL", "rung 0 output slot");
  await place("OTE", "rung 0 output slot", "CONV_RUN");
  await p.click("Test the rung against the goal");
  check("4.1: retry worth 8 XP", (await p.xpNum()) - xp0 === 8, String((await p.xpNum()) - xp0));
  await p.click("Next challenge");
  await place("XIC", "rung 0 condition slot 1", "CONV_START");
  await place("XIC", "rung 0 condition slot 2", "ESTOP_OK");
  await place("XIO", "rung 0 condition slot 3", "ZS_101");
  await place("OTE", "rung 0 output slot", "M201_RUN");
  await p.click("Test the rung against the goal");
  check("4.1: c2 first try: 20 XP, radar +0.5 programming", (await p.xpNum()) - xp0 === 28 && (await p.radar()).includes("Programming 0.5"), `${(await p.xpNum()) - xp0} ${await p.radar()}`);
  await p.click("Next challenge");
  await place("XIC", "rung 0 condition slot 1", "CONV_START");
  await place("TON", "rung 0 output slot");
  await place("XIC", "rung 1 condition slot 1", "T4_0.DN");
  await place("OTE", "rung 1 output slot", "M201_RUN");
  await p.click("Test the rung against the goal");
  check("4.1: c3 TON then DN rung: first try 20 XP", (await p.xpNum()) - xp0 === 48, String((await p.xpNum()) - xp0));

  // ---- 4.2 HMI Tag Bind
  await p.tool(4, "4.2");
  const els = await p.ev("HMI.elements.map(e => ({ label: e.label, answer: e.answer }))");
  const tags = await p.ev("HMI.tags.map(t => t.tag)");
  check("4.2: 5 elements, 6 tags", els.length === 5 && tags.length === 6);
  const bind = async (tag, el) => {
    await p.blur();
    await p.key(String(tags.indexOf(tag) + 1));
    await p.click(`Bind ${tag} to ${el}`);
    await sleep(80);
  };
  const xp1 = await p.xpNum();
  // One target at a time, in order; the wrong bind goes on the valve when it is the target.
  let wrongShown = false;
  for (const e of els) {
    if (/valve/i.test(e.label)) {
      await bind("TT_301", e.label);
      wrongShown = /POS 145.0 %/.test(await main());
    }
    await bind(e.answer, e.label);
    await p.click("Next element");
  }
  check("4.2: wrong tag shows what the element would display", wrongShown);
  check("4.2: 4 first-try elements + 1 retry = 88 XP", (await p.xpNum()) - xp1 === 88, String((await p.xpNum()) - xp1));
  check("4.2: completion cites the p.14 symptom and Form 7", (await main()).includes("p.14") && /Form 7|p\.9/.test(await main()), "");

  // ---- 4.3 Change Control Gate
  await p.tool(4, "4.3");
  const add = text => p.ev(`(() => { const b = [...document.querySelectorAll('main button')].find(b => (b.getAttribute('aria-label') || '').includes(': ' + ${JSON.stringify(text)} + '. Add to plan')); if (!b) return false; b.click(); return true; })()`);
  const steps = await p.ev("CCG.steps.map(s => ({ n: s.n, text: s.text, needs: s.needs.map(x => x.step) }))");
  const xp2 = await p.xpNum();
  await add("Download to the PLC");
  check("4.3: download before backup is rejected with the reason", /Not yet: Download to the PLC/.test(await main()) && /Back up the current program/.test(await main()), "");
  const plan = async () => {
    const done = [];
    while (done.length < steps.length) {
      const s = steps.find(x => !done.includes(x.n) && x.needs.every(n => done.includes(n)));
      await add(s.text);
      done.push(s.n);
    }
  };
  await plan();
  check("4.3: gate cleared after 1 rejection: 8 XP", (await p.xpNum()) - xp2 === 8 && /Gate cleared with 1 rejected step/.test(await main()), String((await p.xpNum()) - xp2));
  await p.click("Next change request");
  await plan();
  check("4.3: clean plan: 20 XP", (await p.xpNum()) - xp2 === 28 && /Gate cleared, no rejected steps/.test(await main()), String((await p.xpNum()) - xp2));

  const notes = await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.fieldNotes') || '[]').map(n => n.tool)");
  check("Field Notes from 4.1, 4.2, 4.3", ["4.1", "4.2", "4.3"].every(t => notes.includes(t)), notes);
  await p.load();
  await p.tool(4, "4.3");
  check("reload keeps 4.3 progress", /CLEARED 2 \/ 3/.test(await main()));
  await p.reset();
  const left = await p.ev("['rungEditor', 'hmiTagBind', 'changeControlGate'].map(k => JSON.parse(localStorage.getItem('techDevLab.v3.' + k) || '{}').played || []).map(a => a.length)");
  check("reset clears 4.1, 4.2, 4.3", left.every(n => n === 0), left);
});
