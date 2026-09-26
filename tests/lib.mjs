// Headless Edge harness for the Tech Dev Lab tests. No npm: Node's built-in
// fetch and WebSocket drive Edge over the DevTools protocol.
//
// Each run gets a throwaway Edge profile in the OS temp folder, deleted on
// close(), so repeated runs don't fill the disk.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const EDGE = process.env.EDGE || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
export const FILE = path.resolve(process.env.TDL_FILE || path.join(HERE, "..", "output", "tech-dev-lab.html"));
export const URL_ = "file:///" + FILE.split(path.sep).join("/");
export const sleep = ms => new Promise(r => setTimeout(r, ms));

// Console lines that are expected and not errors.
const IGNORE = [/in-browser Babel/, /You are using the in-browser Babel transformer/];

export async function open({ width = 1400, height = 1000 } = {}) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "tdl-edge-"));
  const edge = spawn(EDGE, ["--headless=new", "--disable-gpu", "--no-first-run", "--remote-debugging-port=0", `--user-data-dir=${profile}`, `--window-size=${width},${height}`, "about:blank"], { stdio: "ignore" });
  let port;
  for (let i = 0; i < 80 && !port; i++) {
    await sleep(250);
    try { port = fs.readFileSync(path.join(profile, "DevToolsActivePort"), "utf8").split("\n")[0].trim(); } catch {}
  }
  if (!port) throw new Error("Edge did not start");
  let targets;
  for (let i = 0; i < 40 && !targets; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch { await sleep(250); }
  }
  const ws = new WebSocket(targets.find(t => t.type === "page").webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type)) {
      const t = m.params.args.map(a => a.value ?? a.description).join(" ");
      if (!IGNORE.some(re => re.test(t))) errors.push(m.params.type + ": " + t);
    }
  };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async expr => {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result.exceptionDetails) throw new Error(expr.slice(0, 100) + " :: " + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text));
    return r.result.result.value;
  };
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });

  const page = {
    errors, send, ev,
    async load() {
      await send("Page.navigate", { url: URL_ });
      for (let i = 0; i < 120; i++) { await sleep(250); if (await ev("!!document.querySelector('h1')").catch(() => false)) { await sleep(150); return; } }
      throw new Error("app did not render");
    },
    // Fresh storage, optional theme, then reload.
    async fresh(theme = "dark") {
      await page.load();
      await ev(`localStorage.clear(); localStorage.setItem('techDevLab.v3.theme', ${JSON.stringify(theme)}); true`);
      await page.load();
    },
    // Click the first button whose aria-label (or text) starts with label.
    async click(label, { exact = false } = {}) {
      const ok = await ev(`(() => { const L = ${JSON.stringify(label)}; const b = [...document.querySelectorAll('button')].find(b => { const a = b.getAttribute('aria-label') || b.textContent.trim(); return ${exact} ? a === L : a.startsWith(L); }); if (!b || b.disabled) return false; b.click(); return true; })()`);
      await sleep(120);
      return ok;
    },
    async key(k, mods = 0) {
      const named = { Enter: [13, "Enter", "\r"], Escape: [27, "Escape", ""], Tab: [9, "Tab", ""], Delete: [46, "Delete", ""] };
      const [code, codeName, text] = named[k] || [k.toUpperCase().charCodeAt(0), /\d/.test(k) ? "Digit" + k : "Key" + k.toUpperCase(), k];
      await send("Input.dispatchKeyEvent", { type: "keyDown", key: k, code: codeName, windowsVirtualKeyCode: code, modifiers: mods, text: mods ? undefined : text || undefined });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code: codeName, windowsVirtualKeyCode: code, modifiers: mods });
      await sleep(100);
    },
    async blur() { await ev("document.activeElement && document.activeElement.blur(); true"); },
    async tool(layerNum, toolId) {
      await page.click(`Layer ${layerNum}`);
      await sleep(100);
      await page.click(`Tool ${toolId}`);
      await sleep(300);
    },
    text: sel => ev(`(document.querySelector(${JSON.stringify(sel)}) || {}).textContent || ''`),
    xp: () => ev("(document.querySelector('[aria-label$=\" XP\"]') || {}).getAttribute?.('aria-label') || ''"),
    xpNum: async () => Number(((await page.xp()).match(/(\d+) XP/) || [0, 0])[1]),
    radar: () => ev("(document.querySelector('[aria-label^=\"Skill radar\"]') || {}).getAttribute?.('aria-label') || ''"),
    async viewport(width, height = 1000, mobile = false) {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
      await sleep(300);
    },
    async reset() {
      await page.click("Reset progress");
      await page.click("Confirm reset");
      await sleep(300);
    },
    async close() {
      try { ws.close(); } catch {}
      edge.kill();
      await new Promise(r => edge.once("exit", r)).catch(() => {});
      for (let i = 0; i < 20; i++) {
        try { fs.rmSync(profile, { recursive: true, force: true }); break; } catch { await sleep(250); }
      }
    },
  };
  return page;
}

// Assertions: collect, print, and set the exit code.
export function checker(name) {
  const rows = [];
  const check = (label, ok, detail = "") => rows.push({ label, ok: !!ok, detail: typeof detail === "string" ? detail : JSON.stringify(detail) });
  check.done = errors => {
    if (errors) check("no console errors", errors.length === 0, errors.slice(0, 5).join(" | "));
    const failed = rows.filter(r => !r.ok);
    for (const r of rows) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.label}${r.detail && (!r.ok || process.env.VERBOSE) ? "  — " + r.detail : ""}`);
    console.log(`${name}: ${rows.length - failed.length}/${rows.length} passed`);
    process.exitCode = failed.length ? 1 : 0;
  };
  return check;
}

// Run a test body with a page, always closing Edge.
export async function run(name, body, opts) {
  const check = checker(name);
  const page = await open(opts);
  try {
    await body(page, check);
  } catch (e) {
    check("test ran to the end", false, e.stack || String(e));
  } finally {
    check.done(page.errors);
    await page.close();
  }
}
