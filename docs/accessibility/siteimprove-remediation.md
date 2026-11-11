# Siteimprove remediation

Work branch: `feature/accessibility`, based on `dev`.

## Unsupported or prohibited ARIA attributes

The report lists 175 occurrences on 169 public URLs. Public markup had named
generic divs in the homepage action/browse groups, catalog filter/active-filter
groups, and material tags. Local dev already had valid grouping on active filters
and material tags. Added `role="group"` to the remaining three containers.

Local axe/Playwright validation found zero violations across 13 fixture routes
and 101 interaction states. All 179 unit tests, changed-file lint and TypeScript
checks passed. This change has not been deployed or rescanned by Siteimprove.

## Enhanced contrast

The supplied November 4 export is **Color contrast does not meet enhanced
requirement**, a WCAG 2.1 AAA finding (1.4.6). It lists 4,796 occurrences across
213 URLs. This is distinct from the outstanding minimum-contrast AA report.
The export contains page counts, not flagged elements or color pairs.

An independent local scan with axe's `color-contrast-enhanced` rule reproduced
failures on all 13 fixture routes. Shared accent/link and muted text colors failed
against white, soft-white, pale-blue and sand backgrounds. Normal-size enhanced
contrast requires 7:1; large text requires 4.5:1.

| Shared token | Before | After | Lowest ratio on the four tested light surfaces |
| --- | --- | --- | --- |
| `--blue` | `#00629b` | `#004b76` | 7.40:1 |
| `--blue-dark` | `#004f7d` | `#00456d` | 8.10:1 |
| `--muted` | `#526176` | `#3c4a5d` | 7.20:1 |

Both existing root token declarations were updated so later CSS cannot restore
the failing colors. The homepage action hover background now uses the darker
blue token instead of a hard-coded translucent blue. Layout and content remain
the same.

The scanner now optionally enables enhanced contrast **alongside** its default
rules and records the mode in `summary.json`:

```sh
A11Y_ENHANCED_CONTRAST=1 npm run a11y:check
```

Desktop/mobile hover and focus states for homepage action cards are included in
the interaction scan. Local output is saved in ignored `a11y-artifacts/`.

Validation for this work uses an isolated source copy without any `.env` files,
a local fixture API, and Webpack for its linked dependencies. No production
tracking or API endpoint is configured. Running the command directly in a normal
checkout follows Next.js's normal local environment-file behavior.

## Outstanding verification

- Rebuild/deploy through the normal review process and request a Siteimprove rescan.
- Verify all original occurrences in the deployed Siteimprove rescan; the exports
  identify pages and counts rather than the flagged elements.
- Review axe's incomplete results and content-dependent live color combinations.
- Manually test keyboard navigation and screen readers, including authenticated
  flows. Fixture routes are not evidence of full authenticated-flow coverage.

Passing an automated scan does not establish full WCAG 2.1 AA or AAA conformance.

## Enhanced contrast validation results

The final full scan passed with zero detected violations on 13 fixture routes
and 109 interaction states, including action-card hover/focus and catalog
filter/search/reset states. Both minimum and enhanced contrast rules ran. All
179 unit tests, TypeScript and changed-file lint passed. A prior full run hit a
catalog filter-removal navigation timeout; the complete rerun passed.

Before/after reports are saved locally under
`a11y-artifacts/contrast-enhanced/`. The original automated baseline had the
enhanced-contrast rule failing on every fixture route. The final homepage's
enhanced-contrast incomplete results are decorative arrow glyphs (non-text
characters), which require contextual review rather than treating them as
normal-size text failures. Temporary servers were stopped. Changes remain local.

## Additional November 4 reports

| Issue | Affected URLs | Occurrences | Remediation |
| --- | ---: | ---: | --- |
| Headings are not structured | 33 | 33 | Catalog and full series-list cards use H2 beneath H1 (already present on local dev); homepage featured cards explicitly use H3 beneath their section H2. |
| Interactive element does not meet enhanced size | 217 | 3,162 | Standalone navigation, footer, card and action links and form controls have targets at least 44 × 44 CSS pixels. Radio controls have enlarged clickable labels. The header logo link has a 44px minimum height. |
| Page does not start with a level 1 heading | 4 | 4 | The root loading fallback now exposes an H1, and full-page material API failures use an H1 rather than the shared inline error H2. |
| Color contrast does not meet enhanced requirement | 213 | 4,796 | Shared contrast token changes described above. |
| Color contrast does not meet minimum requirement | 1 | 2 | Homepage hero text now has a solid dark backing, independent of image brightness or position. |

The four reported missing-H1 public responses contained footer H2s before the
asynchronously streamed page content in raw HTML. The settled pages did have an
H1. The loading fallback previously had none, so it now has an accessible,
visually hidden H1. The material error fallback also gets an H1. No assertion is
made that the page-count export identifies the exact element causing every flag.

Hero text now sits on `#101f36`; the decorative photograph remains around it.
This guarantees a known background for the heading, lead text and eyebrow,
rather than relying on a fading overlay. Featured-card heading semantics are
independent of compact styling, preserving full-size card typography. Prose
links retain their inline layout (the WCAG 2.5.5 inline exception).

The scanner additionally checks the first exposed heading and, when requested,
actual 44px target bounds, including associated clickable form labels. Disabled
controls are excluded; inline links are exempted only when surrounded by prose.
It is intentionally conservative about equivalent-target exceptions. This is a
supplemental geometric check, not a complete WCAG conformance determination.

Run the expanded checks with:

```sh
A11Y_ENHANCED_CONTRAST=1 A11Y_ENHANCED_TARGETS=1 npm run a11y:check
```

The fixture scan includes selected-program, populated series-material and
filtered-catalog query URLs. Query variants are scanned at desktop/mobile
widths without replaying the unfiltered catalog's filter-removal sequence.
The loading and material-API-failure heading paths are covered by unit tests.

## Batch validation results

The expanded full scan passed: **zero detected violations across 17 fixture routes
and 121 interaction states**, with minimum/enhanced contrast, heading and enhanced
target checks enabled. All **180 unit tests**, TypeScript, and changed-file lint
passed. The custom target check first caught the 31px header logo link; it passed
after the 44px clickable area was added. Final typography/menu adjustments were
also checked in-browser at 1280px, 390px and 320px with zero violations and no
horizontal overflow. The final homepage layout rules were injected into the
otherwise identical fixture app for that targeted check.

Reports and screenshots are under `a11y-artifacts/batch-reports/final/` (ignored
by Git). Temporary fixture/server processes were stopped. No .env files were
read and no production settings changed.
