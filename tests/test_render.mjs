// Every tool slot, both themes, four widths: renders, stays inside the main
// column, no page-level horizontal scroll, no colors from the other palette,
// no console errors. 1.2 must stay "Not yet built."
import { run, sleep } from "./lib.mjs";

const WIDTHS = [900, 1200, 1400, 1920];
const THEMES = ["dark", "light"];

await run("render sweep", async (p, check) => {
  await p.fresh("dark");
  const slots = await p.ev("LAYERS.flatMap(l => l.tools.map(t => ({ layer: l.num, id: t.id, name: t.name, built: !!TOOLS[t.id] })))");
  check("16 tool slots, 15 built, 1.2 not built", slots.length === 16 && slots.filter(s => s.built).length === 15 && !slots.find(s => s.id === "1.2").built, slots.filter(s => !s.built).map(s => s.id));

  for (const theme of THEMES) {
    await p.fresh(theme);
    // Hex colors unique to the other palette, as rgb() strings.
    const foreign = await p.ev(`(() => {
      const mine = THEMES[${JSON.stringify(theme)}], other = THEMES[${JSON.stringify(theme === "dark" ? "light" : "dark")}];
      const rgb = h => 'rgb(' + [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(', ') + ')';
      const m = new Set(Object.values(mine).map(rgb));
      return Object.values(other).map(rgb).filter(c => !m.has(c));
    })()`);
    for (const w of WIDTHS) {
      await p.viewport(w, 1000, false);
      const bad = [];
      for (const s of slots) {
        await p.tool(s.layer, s.id);
        const r = await p.ev(`(() => {
          const panel = document.querySelector('main section[aria-label^="Tool ${s.id}:"]');
          if (!panel) return { err: 'no panel' };
          const main = document.querySelector('main').getBoundingClientRect();
          const pr = panel.getBoundingClientRect();
          const title = panel.querySelector('h3') ? panel.querySelector('h3').textContent : '';
          const built = !panel.textContent.includes('Not yet built.');
          const foreign = ${JSON.stringify(foreign)};
          const hits = new Set();
          for (const el of panel.querySelectorAll('*')) {
            const cs = getComputedStyle(el);
            // A native range input does not paint its computed background (UA default white).
            const bg = el.matches("input[type=range]") ? null : cs.backgroundColor;
            for (const c of [cs.color, bg, cs.borderTopColor]) if (foreign.includes(c)) hits.add(c);
          }
          return {
            title, built,
            pageScroll: document.documentElement.scrollWidth > innerWidth,
            inside: pr.left >= main.left - 1 && pr.right <= main.right + 1,
            foreign: [...hits],
          };
        })()`);
        const want = s.built;
        if (r.err || r.title !== s.name || r.built !== want || r.pageScroll || !r.inside || r.foreign.length) bad.push(`${s.id}: ${JSON.stringify(r)}`);
      }
      check(`${theme} ${w}px: all 16 slots render clean`, bad.length === 0, bad.join(" ; "));
    }
  }
  // Phone width: bottom bar layout, no overflow on any tool.
  await p.fresh("dark");
  await p.viewport(390, 844, true);
  const over = [];
  for (const s of slots) {
    await p.tool(s.layer, s.id);
    if (await p.ev("document.documentElement.scrollWidth > innerWidth")) over.push(s.id);
  }
  check("390px phone: no horizontal overflow on any tool", over.length === 0, over.join(","));
});
