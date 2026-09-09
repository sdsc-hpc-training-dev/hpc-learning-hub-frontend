import { spawnSync } from "node:child_process";

const color = {
  yellow: "\u001b[33m",
  red: "\u001b[31m",
  green: "\u001b[32m",
  reset: "\u001b[0m",
};

function formatColor(value, colorCode) {
  return `${colorCode}${value}${color.reset}`;
}

const checks = [
  {
    name: "Prettier formatting",
    command: "npm",
    args: ["run", "format:check"],
    hint: "Prettier failed. Did you run `npm run format`?",
  },
  {
    name: "ESLint",
    command: "npm",
    args: ["run", "lint"],
    hint: "ESLint failed. Run `npm run lint` and fix the reported issues.",
  },
  {
    name: "TypeScript",
    command: "npm",
    args: ["run", "typecheck"],
    hint: "TypeScript failed. Run `npm run typecheck` to see the errors.",
  },
  {
    name: "Tests and coverage",
    command: "npm",
    args: ["run", "test:coverage"],
    hint: "Tests or coverage failed. Run `npm run test:coverage`.",
  },
  {
    name: "Duplicate code",
    command: "npm",
    args: ["run", "duplication"],
    hint: "Duplication check failed. Keep duplicated code below 3%.",
    warningOnly: true,
  },
  {
    name: "Technical debt metric",
    command: "npm",
    args: ["run", "tech-debt"],
    hint: "Tech debt check failed. Reduce TODO/FIXME/HACK/XXX comment density.",
  },
];

let warnings = 0;

for (const check of checks) {
  console.log(`\n==> ${check.name}`);

  const result = spawnSync(check.command, check.args, {
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    if (check.warningOnly) {
      warnings += 1;
      console.warn(
        formatColor(`\nWarning: ${check.name} failed.`, color.yellow),
      );
      console.warn(formatColor(check.hint, color.yellow));
      continue;
    }

    console.error(
      formatColor(`\nPush blocked: ${check.name} failed.`, color.red),
    );
    console.error(formatColor(check.hint, color.red));
    process.exit(result.status ?? 1);
  }
}

const warningLabel = warnings === 1 ? "warning" : "warnings";
const successMessage =
  warnings === 0
    ? "\nPre-push checks passed."
    : `\nPre-push checks passed with ${warnings} ${warningLabel}.`;

console.log(formatColor(successMessage, color.green));
