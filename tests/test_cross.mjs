// Cross-cutting: diagnostic ribbon, Field Notes drawer and export, theme toggle,
// ribbon width, focus scrolling in .tool-scroll boxes, notes migration.
import { run, sleep } from "./lib.mjs";

await run("cross-cutting", async (p, check) => {
  await p.fresh();
  // Notes kept in the old app state migrate once to techDevLab.v3.fieldNotes.
  await p.ev("(() => { const s = JSON.parse(localStorage.getItem('techDevLab.v3') || '{}'); s.fieldNotes = [{ at: '2026-09-24T01:00:00.000Z', tool: '3.4', toolName: 'Symptom → First Move', tag: 'PT-101', text: 'Old note' }]; localStorage.setItem('techDevLab.v3', JSON.stringify(s)); return true; })()");
  await p.load();
  const migrated = await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.fieldNotes') || '[]').map(n => n.text)");
  const leftInState = await p.ev("(JSON.parse(localStorage.getItem('techDevLab.v3')).fieldNotes || []).length");
  check("old app-state notes migrate to techDevLab.v3.fieldNotes", migrated.some(t => t.includes("Old note")) && leftInState === 0, { migrated, leftInState });

  // Ribbon on 3.4: card = 1, choosing = 4, solved = 5 with 1 and 4 passed.
  const ribbon = () => p.ev(`(() => {
    const n = document.querySelector('nav[aria-label^="Six-step"]');
    if (!n) return null;
    const lis = [...n.querySelectorAll('li')];
    const act = lis.find(l => l.getAttribute('aria-current') === 'step');
    const hex = THEMES[localStorage.getItem('techDevLab.v3.theme') === 'light' ? 'light' : 'dark'].text_dim;
    const dimRgb = 'rgb(' + [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ') + ')';
    const passed = lis.filter(l => getComputedStyle(l).color === dimRgb && getComputedStyle(l.querySelector('span')).borderBottomColor !== 'rgba(0, 0, 0, 0)').map(l => l.textContent.split('.')[0]);
    return { active: act ? act.textContent.split('.')[0] : null, passed: passed.join(','), h: n.getBoundingClientRect().height, cites: n.getAttribute('aria-label').includes('course-design.pdf p.2') };
  })()`);
  await p.tool(3, "3.4");
  let r = await ribbon();
  check("ribbon on 3.4: step 1 on a new card, 32 px, cites course-design p.2", r && r.active === "1" && r.h === 32 && r.cites, r);
  const nums = await p.ev("(() => { const t = JSON.parse(localStorage.getItem('techDevLab.v3.symptomFirstMove')); const s = SFM_BY_ID[t.deck[t.pos]]; const c = s.options.findIndex(o => o.correct); return { wrong: t.order.findIndex(i => i !== c) + 1, right: t.order.indexOf(c) + 1 }; })()");
  await p.blur();
  await p.key(String(nums.wrong));
  await sleep(350); // let the 180 ms color transition finish
  r = await ribbon();
  check("ribbon: choosing lights step 4, step 1 passed", r.active === "4" && r.passed === "1", r);
  await p.key(String(nums.right));
  await sleep(350);
  r = await ribbon();
  check("ribbon: solved lights step 5, steps 1 and 4 passed (text_dim + underline)", r.active === "5" && r.passed === "1,4", r);
  const none = [];
  for (const [l, t] of [[1, "1.1"], [1, "1.4"], [2, "2.1"], [4, "4.1"]]) { await p.tool(l, t); if (await ribbon()) none.push(t); }
  check("no ribbon on 1.1, 1.4, 2.1, 4.1", none.length === 0, none);
  // One fixed step each (user-approved): 1.3 -> 4. Split the loop, 3.3 -> 5. Prove root cause.
  await p.tool(1, "1.3");
  r = await ribbon();
  check("ribbon on 1.3 lights step 4", r && r.active === "4" && r.h === 32, r);
  await p.tool(3, "3.3");
  r = await ribbon();
  check("ribbon on 3.3 lights step 5", r && r.active === "5" && r.h === 32, r);

  // Ribbon width: scrolls at 900 with the active step visible; fits at 1920.
  await p.tool(3, "3.4");
  await p.viewport(900, 1000);
  const fit = () => p.ev(`(() => { const n = document.querySelector('nav[aria-label^="Six-step"]'); const a = n.querySelector('[aria-current="step"]'); const nr = n.getBoundingClientRect(), ar = a.getBoundingClientRect(); return { scrolls: n.scrollWidth > n.clientWidth, visible: ar.left >= nr.left - 1 && ar.right <= nr.right + 1, page: document.documentElement.scrollWidth > innerWidth }; })()`);
  // The active step centers when it changes: deal the next card, then pick.
  await p.blur();
  await p.key("Enter");
  const n2 = await p.ev("(() => { const t = JSON.parse(localStorage.getItem('techDevLab.v3.symptomFirstMove')); const s = SFM_BY_ID[t.deck[t.pos]]; const c = s.options.findIndex(o => o.correct); return t.order.findIndex(i => i !== c) + 1; })()");
  await p.key(String(n2));
  await sleep(800);
  r = await fit();
  check("900 px: ribbon scrolls, active step visible, no page scroll", r.scrolls && r.visible && !r.page, r);
  await p.viewport(1920, 1000);
  await sleep(300);
  r = await fit();
  check("1920 px: ribbon fits", !r.scrolls && r.visible, r);

  // Focus scrolling: a partly hidden control in a .tool-scroll box scrolls into view.
  await p.viewport(1200, 1000);
  await p.tool(3, "3.2");
  const focus = await p.ev(`(() => { const box = [...document.querySelectorAll('main .tool-scroll')].find(b => b.scrollWidth > b.clientWidth); if (!box) return { box: false }; const ctl = [...box.querySelectorAll('button')].pop(); ctl.focus(); return new Promise(res => setTimeout(() => { const br = box.getBoundingClientRect(), cr = ctl.getBoundingClientRect(); res({ box: true, scrolled: box.scrollLeft, visible: cr.left >= br.left - 1 && cr.right <= br.right + 1 }); }, 400)); })()`);
  check("1200 px 3.2: focusing the last contact scrolls it fully into view", focus.box && focus.visible && focus.scrolled > 0, focus);
  await p.send("Emulation.clearDeviceMetricsOverride");
  await sleep(200);

  // Field Notes drawer.
  await p.key("b", 2);
  await sleep(200);
  let d = await p.ev("(() => { const d = document.querySelector('[role=dialog]'); return d ? { w: Math.round(d.getBoundingClientRect().width), text: d.textContent } : null; })()");
  check("Ctrl+B opens the drawer, 380 px, notes listed", d && d.w === 380 && d.text.includes("Symptom → First Move"), d && d.w);
  await p.key("Escape");
  await sleep(200);
  check("Escape closes the drawer", !(await p.ev("!!document.querySelector('[role=dialog]')")));
  await p.click("Open Field Notes");
  await p.ev("window.__blob = null; window.__name = null; URL.createObjectURL = b => { window.__blob = b; return 'blob:test'; }; URL.revokeObjectURL = () => {}; HTMLAnchorElement.prototype.click = function () { window.__name = this.download; }; true");
  await p.click("Export notes as Markdown");
  const md = await p.ev("window.__blob ? window.__blob.text() : ''");
  const fname = await p.ev("window.__name");
  check("Markdown export: file name, header, level and XP, Form 7 under 3.4", /^tech-dev-lab-field-notes-\d{4}-\d{2}-\d{2}\.md$/.test(fname) && md.startsWith("# Tech Dev Lab — Field Notes") && /- Level: \d/.test(md) && /- XP: \d+/.test(md) && /## 3\.4 Symptom → First Move\s+Template Pack form: 7\. /.test(md), { fname, head: md.slice(0, 160) });
  await p.click("Clear all notes");
  check("clear needs a second click", (await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.fieldNotes') || '[]').length")) > 0);
  await p.click("Confirm: clear all notes");
  check("clear confirmed: empty state shown", (await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.fieldNotes') || '[]').length")) === 0 && (await p.ev("document.querySelector('[role=dialog]').textContent")).includes("Nothing logged yet. Every correct decision writes a line here."));
  await p.click("Close Field Notes");
  await p.viewport(899, 1000);
  await p.click("Open Field Notes");
  d = await p.ev("Math.round(document.querySelector('[role=dialog]').getBoundingClientRect().width) + '/' + document.documentElement.clientWidth");
  check("drawer is full width under 900 px", d.split("/")[0] === d.split("/")[1], d);
  await p.click("Close Field Notes");
  await p.send("Emulation.clearDeviceMetricsOverride");
  await sleep(200);

  // Theme toggle: Ctrl+J, persists, survives Reset; toggle is 44 px.
  await p.key("j", 2);
  await sleep(400);
  check("Ctrl+J switches to light", (await p.ev("localStorage.getItem('techDevLab.v3.theme')")) === "light" && (await p.ev("getComputedStyle(document.body).backgroundColor")) === "rgb(247, 248, 250)");
  await p.load();
  check("light theme persists across reload", (await p.ev("localStorage.getItem('techDevLab.v3.theme')")) === "light" && (await p.ev("document.querySelector('button[aria-label^=\"Light mode is on\"]') !== null")));
  await p.reset();
  check("Reset keeps the theme", (await p.ev("localStorage.getItem('techDevLab.v3.theme')")) === "light");
  check("theme toggle is 44 px tall", (await p.ev("Math.round(document.querySelector('button[aria-label$=\"(Ctrl or Cmd + J)\"]').getBoundingClientRect().height)")) >= 44);
  await p.click("Light mode is on");
  check("toggle button returns to dark", (await p.ev("localStorage.getItem('techDevLab.v3.theme')")) === "dark");
});
