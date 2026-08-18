import { copyFileSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const clientDir = fileURLToPath(new URL("../build/client/", import.meta.url));
const swTemplate = fileURLToPath(new URL("./sw.js", import.meta.url));
const BASENAME_DIR = "sudoku-helper";

const prerenderedShell = join(clientDir, BASENAME_DIR, "index.html");
const flattenedShell = join(clientDir, "index.html");
if (existsSync(prerenderedShell) && !existsSync(flattenedShell)) {
  copyFileSync(prerenderedShell, flattenedShell);
  copyFileSync(prerenderedShell, join(clientDir, "404.html"));
}

function collect(dir, base, out) {
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collect(full, base, out);
    } else {
      out.push(relative(base, full).split(sep).join("/"));
    }
  }
}

const files = [];
collect(clientDir, clientDir, files);
const precache = files.filter((f) => f !== "sw.js" && !f.startsWith(`${BASENAME_DIR}/`));

const template = readFileSync(swTemplate, "utf8");
const sw = template.replace(
  "// __PRECACHE__",
  `const PRECACHE = ${JSON.stringify(precache)};`,
);
writeFileSync(join(clientDir, "sw.js"), sw);

console.log(`Service worker generated with ${precache.length} precached files.`);
