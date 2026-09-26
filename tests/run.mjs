// Runs every test_*.mjs in this folder, one at a time, and prints a summary.
//   node tests/run.mjs            all tests against output/tech-dev-lab.html
//   node tests/run.mjs 21 cross   only files whose name contains "21" or "cross"
//   TDL_FILE=path node tests/run.mjs   test another build of the file
// Needs Node 22+ (built-in fetch and WebSocket) and Microsoft Edge.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const filters = process.argv.slice(2);
const files = fs.readdirSync(HERE).filter(f => /^test_.*\.mjs$/.test(f)).filter(f => !filters.length || filters.some(x => f.includes(x))).sort();
const results = [];
for (const f of files) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [path.join(HERE, f)], { encoding: "utf8", timeout: 10 * 60 * 1000 });
  const out = (r.stdout || "") + (r.stderr || "");
  const summary = (out.trim().split("\n").pop() || "").trim();
  const ok = r.status === 0;
  results.push({ f, ok, summary, s: Math.round((Date.now() - t0) / 1000) });
  console.log(`${ok ? "PASS" : "FAIL"}  ${f}  ${summary}  (${results.at(-1).s}s)`);
  if (!ok) console.log(out.split("\n").filter(l => l.startsWith("FAIL")).map(l => "      " + l).join("\n"));
}
const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} test files passed`);
process.exitCode = failed ? 1 : 0;
