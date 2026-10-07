/* eslint-disable no-undef, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-template-expressions, @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-unary-minus, @typescript-eslint/use-unknown-in-catch-callback-variable, sonarjs/cognitive-complexity, sonarjs/no-os-command-from-path, max-lines-per-function, max-depth, complexity, security/detect-object-injection, security/detect-non-literal-fs-filename */

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import net from "node:net";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { scanInteractions } from "./a11y-interactions.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const reportDir = path.join(repoRoot, "a11y-artifacts");
async function discoverPages(directory, segments = []) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const pages = [];
  if (
    entries.some(
      (entry) => entry.isFile() && /^page\.(tsx|ts|jsx|js)$/.test(entry.name),
    )
  ) {
    pages.push(`/${segments.join("/")}`);
  }
  for (const entry of entries) {
    if (
      !entry.isDirectory() ||
      entry.name.startsWith("_") ||
      entry.name.startsWith("@")
    )
      continue;
    const nextSegments = entry.name.startsWith("(")
      ? segments
      : [...segments, entry.name];
    pages.push(
      ...(await discoverPages(path.join(directory, entry.name), nextSegments)),
    );
  }
  return pages;
}

function pagePattern(route) {
  const segments = route.split("/").filter(Boolean);
  if (segments.length === 0) return /^\/$/;
  // Route literals are escaped; only known dynamic-segment patterns are added.
  // eslint-disable-next-line security/detect-non-literal-regexp
  return new RegExp(
    `^${segments
      .map((segment) => {
        if (segment.startsWith("[[...")) return "(?:/.*)?";
        if (segment.startsWith("[...")) return "/.+";
        if (segment.startsWith("[")) return "/[^/]+";
        return `/${segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`;
      })
      .join("")}/?$`,
  );
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => {
        resolve(port);
      });
    });
  });
}

async function isServerReachable(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(processRef, timeoutMs = 120000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Next.js dev server did not start in time."));
    }, timeoutMs);

    const onData = (chunk) => {
      const output = chunk.toString();
      if (/ready|started server|Local:|compiled successfully/i.test(output)) {
        clearTimeout(timer);
        processRef.stdout.off("data", onData);
        processRef.stderr.off("data", onData);
        resolve();
      }
    };

    processRef.stdout.on("data", onData);
    processRef.stderr.on("data", onData);

    processRef.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Next.js dev server exited early with code ${code}.`));
    });

    if (Date.now() - start > timeoutMs) {
      clearTimeout(timer);
      reject(new Error("Timed out waiting for dev server."));
    }
  });
}

async function main() {
  const pages = await discoverPages(path.join(repoRoot, "app"));
  const patterns = pages.map(pagePattern);
  const routes = [
    ...new Set(pages.filter((route) => !route.includes("["))),
  ].sort((a, b) => a.localeCompare(b));
  const queued = new Set(routes);
  await fs.mkdir(reportDir, { recursive: true });

  const existingBaseUrl = process.env.A11Y_BASE_URL ?? "http://127.0.0.1:3000";
  if (
    process.env.A11Y_BASE_URL &&
    !(await isServerReachable(existingBaseUrl))
  ) {
    throw new Error(`Accessibility server is unreachable: ${existingBaseUrl}`);
  }
  const baseUrl = (await isServerReachable(existingBaseUrl))
    ? existingBaseUrl
    : `http://127.0.0.1:${await getFreePort()}`;

  const summary = {
    generatedAt: new Date().toISOString(),
    routes: [],
    totals: {
      pagesScanned: 0,
      violations: 0,
    },
  };

  let serverProcess;

  try {
    if (!(await isServerReachable(existingBaseUrl))) {
      serverProcess = spawn(
        "npm",
        [
          "run",
          "dev",
          "--",
          "--hostname",
          "127.0.0.1",
          "--port",
          String(baseUrl.split(":").pop()),
        ],
        {
          cwd: repoRoot,
          env: {
            ...process.env,
            NEXT_TELEMETRY_DISABLED: "1",
          },
          stdio: ["ignore", "pipe", "pipe"],
          detached: process.platform !== "win32",
        },
      );

      await waitForServer(serverProcess);
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(15000);

    for (const route of routes) {
      const fullUrl = `${baseUrl}${route}`;
      const routeName =
        route === "/" ? "index" : route.replace(/^\//, "").replace(/\//g, "-");
      const resultPath = path.join(reportDir, `${routeName}.json`);

      const response = await page.goto(fullUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page.waitForLoadState("load", { timeout: 60000 });
      if (!response?.ok()) {
        throw new Error(
          `Cannot scan ${route}: HTTP ${response?.status() ?? "unknown"}`,
        );
      }
      const results = await new AxeBuilder({ page }).analyze();
      // Follow linked page paths, including concrete IDs for dynamic routes.
      // Ignore query/hash variants and endpoints that are not app pages.
      const links = await page
        .locator("a[href], area[href]")
        .evaluateAll((elements) => elements.map((element) => element.href));
      for (const href of links) {
        const linked = new URL(href, fullUrl);
        const linkedRoute = linked.pathname.replace(/\/$/, "") || "/";
        if (
          linked.origin === new URL(baseUrl).origin &&
          patterns.some((pattern) => pattern.test(linkedRoute)) &&
          !queued.has(linkedRoute)
        ) {
          queued.add(linkedRoute);
          routes.push(linkedRoute);
        }
      }
      const states = [];
      await scanInteractions(page, fullUrl, async (state) => {
        const stateResults = await new AxeBuilder({ page }).analyze();
        states.push({ state, ...stateResults });
      });
      const uniqueViolations = new Map();
      for (const result of [results, ...states]) {
        for (const violation of result.violations) {
          const existing = uniqueViolations.get(violation.id);
          if (!existing) {
            uniqueViolations.set(violation.id, {
              ...violation,
              nodes: [...violation.nodes],
            });
          } else {
            for (const node of violation.nodes) {
              if (
                !existing.nodes.some(
                  (item) =>
                    JSON.stringify(item.target) === JSON.stringify(node.target),
                )
              ) {
                existing.nodes.push(node);
              }
            }
          }
        }
      }
      const violations = [...uniqueViolations.values()].map((violation) => ({
        id: violation.id,
        impact: violation.impact ?? "moderate",
        help: violation.help,
        nodes: violation.nodes.length,
      }));

      const routeSummary = {
        route,
        url: fullUrl,
        violationCount: violations.length,
        violations,
        statesScanned: states.map(({ state }) => state),
      };

      summary.routes.push(routeSummary);
      summary.totals.pagesScanned += 1;
      summary.totals.violations += violations.length;

      await fs.writeFile(
        resultPath,
        JSON.stringify({ ...results, states }, null, 2),
      );
      console.log(`${route}: ${violations.length} accessibility issue(s)`);
    }

    const severityCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    for (const route of summary.routes) {
      for (const violation of route.violations) {
        const impact = (violation.impact ?? "moderate").toLowerCase();
        if (
          impact === "critical" ||
          impact === "serious" ||
          impact === "moderate" ||
          impact === "minor"
        ) {
          severityCounts[impact] += 1;
        }
      }
    }

    console.log("\nSummary:");
    for (const route of summary.routes) {
      const count = route.violationCount;
      console.log(
        `- ${route.route}: ${count} ${count === 1 ? "issue" : "issues"}`,
      );
    }
    console.log(
      `\nTotal: ${summary.totals.violations} accessibility violations across ${summary.totals.pagesScanned} pages`,
    );
    console.log(
      `Critical: ${severityCounts.critical} | Serious: ${severityCounts.serious} | Moderate: ${severityCounts.moderate} | Minor: ${severityCounts.minor}`,
    );

    await browser.close();
    await fs.writeFile(
      path.join(reportDir, "summary.json"),
      JSON.stringify(summary, null, 2),
    );

    if (summary.totals.violations > 0) {
      console.error(
        `\nAccessibility check failed: ${summary.totals.violations} violation(s) found across ${summary.totals.pagesScanned} page(s).`,
      );
      process.exitCode = 1;
      return;
    }

    console.log("Accessibility check passed: no violations found.");
  } finally {
    if (serverProcess) {
      try {
        if (process.platform !== "win32") {
          process.kill(-serverProcess.pid, "SIGTERM");
        } else {
          serverProcess.kill("SIGTERM");
        }
      } catch {
        try {
          serverProcess.kill("SIGTERM");
        } catch {
          // Ignore cleanup failures; the process may already have exited.
        }
      }
    }
  }
}

main().catch((error) => {
  console.error("Accessibility check failed unexpectedly:", error);
  process.exit(1);
});
