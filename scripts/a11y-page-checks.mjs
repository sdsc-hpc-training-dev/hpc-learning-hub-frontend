/* eslint-disable no-undef, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-template-expressions, complexity */

// Supplemental checks: axe's target-size rule checks 24px AA spacing, not the
// 44px WCAG 2.1 AAA target dimensions reported by Siteimprove.
export async function checkPageStructure(page, enhancedTargets) {
  const findings = await page.evaluate((checkTargets) => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" &&
        !element.closest('[aria-hidden="true"], [inert]');
    };
    const target = (element) => {
      const parts = [];
      for (let node = element; node?.parentElement; node = node.parentElement) {
        if (node.id) { parts.unshift(`#${CSS.escape(node.id)}`); break; }
        const index = [...node.parentElement.children].indexOf(node) + 1;
        parts.unshift(`${node.tagName.toLowerCase()}:nth-child(${index})`);
      }
      return [parts.join(" > ")];
    };
    const node = (element, message) => ({
      target: target(element), html: element.outerHTML.slice(0, 1200),
      failureSummary: message,
    });
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(visible);
    const firstHeading = headings.at(0);
    const headingNodes = firstHeading?.tagName === "H1" ? [] : [
      node(firstHeading ?? document.body,
        "The first exposed page heading must be a level 1 heading."),
    ];
    const inlineLink = (element) => {
      const paragraph = element.tagName === "A" && element.closest("p");
      if (!paragraph) return false;
      const prose = paragraph.cloneNode(true);
      prose.querySelectorAll("a").forEach((link) => link.remove());
      return Boolean(prose.textContent.trim());
    };
    const targets = [];
    if (checkTargets) {
      for (const element of document.querySelectorAll('header a[href], main a[href], footer a[href], button, input:not([type="hidden"]), select, textarea')) {
        if (!visible(element) || element.disabled) continue;
        // Only exempt links that are actually embedded in prose, not standalone
        // links placed inside a paragraph for layout.
        if (inlineLink(element)) continue;
        const areas = [element, ...(element.labels ?? [])]
          .map((item) => item.getBoundingClientRect());
        if (areas.some((rect) => rect.width >= 44 && rect.height >= 44)) continue;
        const rect = element.getBoundingClientRect();
        targets.push(node(element, `Target is ${rect.width.toFixed(2)} × ${rect.height.toFixed(2)} CSS pixels; expected at least 44 × 44 (or an applicable WCAG exception).`));
      }
    }
    return { headingNodes, targets };
  }, enhancedTargets);
  const violations = [];
  if (findings.headingNodes.length) violations.push({
    id: "page-first-heading-h1", impact: "moderate",
    help: "Start each page with a level 1 heading", nodes: findings.headingNodes,
  });
  if (findings.targets.length) violations.push({
    id: "target-size-enhanced", impact: "moderate",
    help: "Standalone interactive targets must be at least 44 × 44 CSS pixels",
    nodes: findings.targets,
  });
  return violations;
}
