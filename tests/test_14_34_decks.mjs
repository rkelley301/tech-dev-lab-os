// Tools 1.4 Trap Spotter and 3.4 Symptom -> First Move: the card decks.
import { run, sleep } from "./lib.mjs";

await run("1.4 + 3.4 decks", async (p, check) => {
  const status = () => p.ev("(document.querySelector('main [aria-live=polite]') || {}).textContent || ''");

  // ---- 1.4 Trap Spotter (storage techDevLab.v2.trapSpotter, set by request)
  await p.fresh();
  await p.tool(1, "1.4");
  const TS = "techDevLab.v2.trapSpotter";
  const ts = () => p.ev(`JSON.parse(localStorage.getItem('${TS}'))`);
  let t = await ts();
  check("1.4: 8 traps, 4 unique choices", t.deck.length === 8 && new Set(t.choices).size === 4 && t.choices.includes(t.deck[t.pos]), t.choices);
  check("1.4: card cites Field Learning Plan p.10", (await p.text("main section")).includes("Field Learning Plan.pdf p.10"));
  let right = t.choices.indexOf(t.deck[t.pos]) + 1;
  let wrong = right === 1 ? 2 : 1;
  const xp0 = await p.xpNum();
  await p.blur();
  await p.key(String(wrong));
  t = await ts();
  check("1.4: miss recorded, trap scheduled to return", t.tried.length === 1 && t.deck.length === 9, { tried: t.tried, len: t.deck.length });
  await p.key(String(right));
  check("1.4: retry worth 5 XP", (await p.xpNum()) - xp0 === 5, String((await p.xpNum()) - xp0));
  const firstId = t.deck[t.pos];
  await p.key("Enter");
  t = await ts();
  right = t.choices.indexOf(t.deck[t.pos]) + 1;
  await p.key(String(right));
  check("1.4: first try worth 15 XP", (await p.xpNum()) - xp0 === 20);
  check("1.4: radar +0.4 electrical", (await p.radar()).includes("Electrical 0.4"), await p.radar());
  // Replay a played trap: 0 XP.
  await p.ev(`(() => { const t = JSON.parse(localStorage.getItem('${TS}')); const others = t.choices.filter(c => c !== ${JSON.stringify(firstId)}).slice(0, 3); t.deck = [${JSON.stringify(firstId)}, ...t.deck]; t.pos = 0; t.choices = [${JSON.stringify(firstId)}, ...others]; t.tried = []; t.solved = false; localStorage.setItem('${TS}', JSON.stringify(t)); return true; })()`);
  await p.load();
  await p.tool(1, "1.4");
  await p.blur();
  await p.key("1");
  check("1.4: replay worth 0 XP", (await p.xpNum()) - xp0 === 20, String((await p.xpNum()) - xp0));
  check("1.4: decision log rows", (await p.ev("document.querySelectorAll('main table tbody tr').length")) >= 2);
  await p.reset();
  check("1.4: reset clears progress", ((await ts()) || { played: [] }).played.length === 0);

  // ---- 3.4 Symptom -> First Move (storage techDevLab.v3.symptomFirstMove)
  // The embed holds only the 52 playable symptoms (the other 25 need review).
  const counts = await p.ev("({ total: SFM_SYMPTOMS.length, options: SFM_SYMPTOMS.filter(s => s.options && s.options.length === 4).length, cited: SFM_SYMPTOMS.every(s => s.source && s.options.every(o => o.cites && o.cites.length)) })");
  check("3.4: 52 playable symptoms, 4 options each, all cited", counts.total === 52 && counts.options === 52 && counts.cited, counts);
  await p.tool(3, "3.4");
  const SK = "techDevLab.v3.symptomFirstMove";
  const nums = () => p.ev(`(() => { const t = JSON.parse(localStorage.getItem('${SK}')); const s = SFM_BY_ID[t.deck[t.pos]]; const c = s.options.findIndex(o => o.correct); return { wrong: t.order.findIndex(i => i !== c) + 1, right: t.order.indexOf(c) + 1, len: t.deck.length, id: s.id }; })()`);
  let n = await nums();
  check("3.4: card cites its source page", /SOURCE: IC_Fundamentals_Drill_Input_Library\.pdf p\.1[345]/.test(await p.text("main section")));
  const xp1 = await p.xpNum();
  await p.blur();
  await p.key(String(n.wrong));
  check("3.4: wrong move shows a consequence", (await status()).length > 20, await status());
  check("3.4: missed pattern scheduled to return", (await nums()).len === n.len + 1);
  await p.key(String(n.right));
  check("3.4: retry worth 5 XP", (await p.xpNum()) - xp1 === 5);
  // Links the correct move clears; some cards clear none (cut is empty in the library).
  const cleared = await p.ev("[...document.querySelectorAll('ol[aria-label=\"Diagnostic chain\"] li')].filter(l => /cleared/.test(l.getAttribute('aria-label'))).length");
  const cut = await p.ev(`SFM_BY_ID[${JSON.stringify(n.id)}].options.find(o => o.correct).cut.length`);
  check("3.4: chain shows what the move cleared", cleared === cut, `${cleared} cleared, card cut ${cut}`);
  await p.key("Enter");
  n = await nums();
  await p.key(String(n.right));
  check("3.4: first try worth 15 XP, radar +0.4 PLC", (await p.xpNum()) - xp1 === 20 && (await p.radar()).includes("PLC 0.4"), `${(await p.xpNum()) - xp1} ${await p.radar()}`);
  const notes = await p.ev("JSON.parse(localStorage.getItem('techDevLab.v3.fieldNotes') || '[]').filter(x => x.tool === '3.4').length");
  check("3.4: Field Notes written from techDevLab.v3.fieldNotes", notes === 2, String(notes));
  await p.key("Enter");
  const pos = (await p.ev(`JSON.parse(localStorage.getItem('${SK}')).pos`));
  await p.load();
  await p.tool(3, "3.4");
  check("3.4: reload keeps the deck position", (await p.ev(`JSON.parse(localStorage.getItem('${SK}')).pos`)) === pos);
  await p.viewport(390, 844, true);
  check("3.4: phone width, no overflow, 44 px buttons", await p.ev("document.documentElement.scrollWidth <= innerWidth && [...document.querySelectorAll('main button')].every(b => { const h = b.getBoundingClientRect().height; return !h || h >= 44; })"));
  await p.send("Emulation.clearDeviceMetricsOverride");
  await sleep(200);
  await p.reset();
  check("3.4: reset clears progress", (((await p.ev(`JSON.parse(localStorage.getItem('${SK}'))`)) || { played: [] }).played || []).length === 0);
});
