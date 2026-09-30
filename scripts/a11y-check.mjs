/* eslint-disable no-undef, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-template-expressions, @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-unary-minus, @typescript-eslint/use-unknown-in-catch-callback-variable, sonarjs/cognitive-complexity, sonarjs/no-os-command-from-path, max-lines-per-function, max-depth, complexity, security/detect-object-injection, security/detect-non-literal-fs-filename */

import fs from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import net from "node:net";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const reportDir = path.join(repoRoot, "a11y-artifacts");
const routes = [
  "/",
  "/events",
  "/materials",
  "/learning-paths",
  "/my-learning",
  "/maintainer",
];

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

function cleanupStaleNextProcesses() {
  if (process.platform === "win32") {
    return;
  }

  try {
    spawnSync("pkill", ["-f", "next dev"], { stdio: "ignore" });
  } catch {
    // Ignore cleanup failures; the script should continue if there are no stale Next processes.
  }
}

async function main() {
  await fs.mkdir(reportDir, { recursive: true });
  cleanupStaleNextProcesses();

  const preferredPort = 3000;
  const existingBaseUrl = `http://127.0.0.1:${preferredPort}`;
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

    for (const route of routes) {
      const fullUrl = `${baseUrl}${route}`;
      const routeName =
        route === "/" ? "index" : route.replace(/^\//, "").replace(/\//g, "-");
      const resultPath = path.join(reportDir, `${routeName}.json`);

      await page.goto(fullUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page.waitForLoadState("load", { timeout: 60000 });
      const results = await new AxeBuilder({ page }).analyze();
      const violations = results.violations.map((violation) => ({
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
      };

      summary.routes.push(routeSummary);
      summary.totals.pagesScanned += 1;
      summary.totals.violations += violations.length;

      await fs.writeFile(resultPath, JSON.stringify(results, null, 2));
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
      process.exit(1);
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
