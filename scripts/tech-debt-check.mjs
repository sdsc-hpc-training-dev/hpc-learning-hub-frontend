import fs from "node:fs";
import path from "node:path";

const roots = ["app", "components", "hooks", "lib", "types"];
const sourceExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".mjs",
  ".cjs",
]);
const ignoredDirectories = new Set([
  "node_modules",
  ".next",
  "coverage",
  "report",
  "dist",
  "out",
]);
const debtPattern = /\b(TODO|FIXME|HACK|XXX)\b/i;
const maxDebtCommentsPerKloc = 5;

let debtComments = 0;
let nonblankLines = 0;

function walk(directory) {
  if (!fs.existsSync(directory)) {
    return;
  }

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!entry.isFile() || !sourceExtensions.has(path.extname(entry.name))) {
      continue;
    }

    const text = fs.readFileSync(fullPath, "utf8");
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

    nonblankLines += lines.length;
    debtComments += lines.filter((line) => debtPattern.test(line)).length;
  }
}

roots.forEach(walk);

const kloc = nonblankLines / 1000;
const density = kloc === 0 ? 0 : debtComments / kloc;
const formattedDensity = density.toFixed(2);

console.log("Technical debt metric");
console.log(`TODO/FIXME/HACK/XXX comments: ${debtComments}`);
console.log(`Nonblank source lines: ${nonblankLines}`);
console.log(
  `Debt comments per KLOC: ${formattedDensity} <= ${maxDebtCommentsPerKloc}`,
);

if (process.env.GITHUB_STEP_SUMMARY) {
  const summary = [
    "## Technical debt metric",
    "",
    "| Metric | Value | Limit |",
    "| --- | ---: | ---: |",
    `| TODO/FIXME/HACK/XXX comments | ${debtComments} | - |`,
    `| Nonblank source lines | ${nonblankLines} | - |`,
    `| Debt comments per KLOC | ${formattedDensity} | <= ${maxDebtCommentsPerKloc} |`,
  ].join("\n");

  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
}

if (density > maxDebtCommentsPerKloc) {
  console.error(
    `Technical debt density is ${formattedDensity} comments/KLOC, above limit ${maxDebtCommentsPerKloc}.`,
  );
  process.exit(1);
}
