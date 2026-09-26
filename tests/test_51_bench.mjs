// Tool 5.1 The Bench.
import { run, sleep } from "./lib.mjs";

await run("5.1 The Bench", async (p, check) => {
  await p.fresh();
  await p.tool(5, "5.1");
  const main = () => p.text("main section");
  const fill = () => p.ev(`(() => { let n = 0; for (const el of document.querySelectorAll('main textarea, main input[type=text]')) { const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement : HTMLInputElement; Object.getOwnPropertyDescriptor(proto.prototype, 'value').set.call(el, 'test answer'); el.dispatchEvent(new Event('input', { bubbles: true })); n++; } for (const s of document.querySelectorAll('main select')) { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, s.options[s.options.length - 1].value); s.dispatchEvent(new Event('change', { bubbles: true })); n++; } return n; })()`);
  const runDrill = async () => {
    const steps = await p.ev("(() => { const t = JSON.parse(localStorage.getItem('techDevLab.v3.drill')); return DRILL_BY_ID[t.session.id].steps.length; })()");
    for (let i = 0; i < steps; i++) {
      await fill();
      await sleep(60);
      if (!(await p.click("Next step")) && !(await p.click("Finish the drill"))) return false;
      await sleep(80);
    }
    return true;
  };

  check("5.1: 18 drills listed", (await p.ev("document.querySelectorAll('[aria-label=\"Drills\"] button').length")) === 18);
  check("5.1: drills cite the Drill Pack", (await main()).includes("Drill Pack.pdf"));
  await p.click("Drill 1:");
  // The inputs card labels the bracket; the step text must have it filled.
  check("5.1: bracket filled with a drawn input", /Dump everything from memory on (?!\[fundamental\])\S.* covering/.test(await main()));
  // An empty answer does not advance.
  const stepBefore = await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.drill')).session.step");
  await p.click("Next step");
  check("5.1: empty answer blocked", (await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.drill')).session.step")) === stepBefore);
  check("5.1: why-it-works hidden until the end", !(await main()).includes("Uses no-lookup blank-page recall"));
  const xp0 = await p.xpNum();
  check("5.1: drill 1 runs to the end", await runDrill());
  check("5.1: why-it-works shown after the last step", (await main()).includes("Uses no-lookup blank-page recall"));
  check("5.1: first completion 25 XP, radar +0.5 on all four", (await p.xpNum()) - xp0 === 25 && /Electrical 0\.5, Instrumentation 0\.5, PLC 0\.5, Programming 0\.5/.test(await p.radar()), `${(await p.xpNum()) - xp0} ${await p.radar()}`);
  await p.click("Run this drill again with new inputs");
  await runDrill();
  check("5.1: repeat 5 XP, radar unchanged", (await p.xpNum()) - xp0 === 30 && /Electrical 0\.5,/.test(await p.radar()), String((await p.xpNum()) - xp0));
  const comp = await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.drill')).completions['drill-001']");
  check("5.1: review spacing 1 then 3 days", comp && comp.count === 2, comp);
  await p.click("Back to the drill list");
  // Drill 18 has no why-it-works in the source.
  await p.click("Drill 18:");
  await runDrill();
  check("5.1: drill 18 says the Drill Pack gives no why", (await main()).includes("The Drill Pack gives no \"why it works\" for this drill."));
  const notes = await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.fieldNotes') || '[]').filter(n => n.tool === '5.1').length");
  check("5.1: Field Notes line per completion", notes === 3, String(notes));
  await p.viewport(390, 844, true);
  check("phone width: five-layer bottom bar, no overflow", await p.ev("document.documentElement.scrollWidth <= innerWidth"));
  await p.send("Emulation.clearDeviceMetricsOverride");
  await sleep(200);
  await p.reset();
  check("5.1: reset clears the bench", (await p.ev("Object.keys((JSON.parse(localStorage.getItem('techDevLab.v3.drill') || '{}').completions) || {}).length")) === 0);
});
