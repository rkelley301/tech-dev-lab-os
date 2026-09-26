// Screenshot one tool: node tests/shots.mjs <outDir> <layer> <tool> [theme] [width] [setupJs]
// Saves <outDir>/<tool>-<theme>-<width>.png. setupJs runs in the page after the tool opens.
import fs from "node:fs";
import path from "node:path";
import { open, sleep } from "./lib.mjs";

const [outDir, layer, tool, theme = "dark", width = "1400", setup = ""] = process.argv.slice(2);
const p = await open();
try {
  await p.viewport(Number(width), 1100, Number(width) < 900);
  await p.fresh(theme);
  await p.tool(layer, tool);
  if (setup) { await p.ev(setup); await sleep(600); }
  const h = await p.ev("Math.min(4000, document.documentElement.scrollHeight)");
  await p.viewport(Number(width), h, Number(width) < 900);
  const shot = await p.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
  const file = path.join(outDir, `${tool}-${theme}-${width}.png`);
  fs.writeFileSync(file, Buffer.from(shot.result.data, "base64"));
  console.log(file, p.errors.length ? "ERRORS: " + p.errors.join(" | ") : "");
} finally {
  await p.close();
}
