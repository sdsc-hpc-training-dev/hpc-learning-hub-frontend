# Next.js Architecture: Author Handoff

**Stage:** Author draft, for one independent review and one final author
correction pass. This report is author validation, not an independent verdict.
No application code, dependency manifests/lockfiles, shared checkout contents,
remote branches, cloud resources, pushes, PRs or merges were changed.

## Frozen Inputs

| Source | Exact revision and acquisition |
| --- | --- |
| Frontend default `master` | `67cbb3f24cbe3ca1f671e647d86421356a93c7ff`; `git fetch origin` then `git ls-remote --symref origin HEAD`. Dedicated worktree created at that SHA. |
| Frontend shared checkout | `9a59ec48d41d65f77117f9cfdb450fc3800bca28`; left on `master`, initially clean. |
| Prototype remote default `main` | `deaf8e5371dd46fd525c0d668c49e3b50aa0aa46`; remote inspected and fetched into a separate source clone, not the prototype checkout. Latest `v1.0.0` examined. |
| Prototype local working branch | `4e318f39d2208bfc5dc99239d67445db70174e77`, `codex/v0.0.6-auth-prototype`; initially clean. Earlier local `origin/main` was `f6bfa6a`, so it was not treated as latest. |
| Gateway fixed contract baseline | `fda21d619dcc5119f1133501bafa8cc7e800c7cf`; read with `git show`, including all five named contract documents. Concurrent author's module diagram was not used. |

Source paths/links and precedence are recorded in the
[architecture document](../nextjs-modules.md). The exact scoped files read were
frontend `AGENTS.md`, manifest/lockfile, README, `app/`, `types/`, Jest, TS, Next,
ESLint, Knip and CI configuration; the six curated prototype documentation
sources; both `v0.0.6` and `v1.0.0` account/QA notes; and current `programs.js`,
`material.js`, `learning-paths.js`, `saved.js` journey code.

**Worktree:** `C:\Users\ofgar\.codex\worktrees\nextjs-module-diagram`

**Branch:** `codex/nextjs-module-diagram`

**Source snapshot:** `C:\Users\ofgar\.codex\tmp\nextjs-prototype-source`

**Local validation area:** `C:\Users\ofgar\.codex\tmp\nextjs-diagram-validation`

The draft commit is the commit containing this handoff; resolve it with
`git log -1 --format=%H -- docs/architecture/review/nextjs-author-handoff.md`
before any subsequent correction. The exact SHA is also returned in the task
handoff, avoiding a self-referential commit hash inside its own contents.

## Deliverables

- [Feature/route architecture and folder layout](../nextjs-modules.md).
- [Deterministic Mermaid SVG](../assets/nextjs-modules.svg).
- This handoff; README links to both primary deliverables.

## Reproduce and Validate

Tools used: Node `20.18.3`, Mermaid CLI `11.17.0`, Mermaid `11.17.2`, Puppeteer
`24.43.1`, Chrome `152.0.7977.76`, Windows with Arial. Renderer dependencies were
already cached outside the repository; no application dependencies were added.
Repeat rendering on this pinned toolchain is checked byte-for-byte. Different
font/browser/platform versions may change geometry and require a fresh check.

The manifest/lockfile specify Next `16.3.3`, React `19.2.8`; no installed Next
package was present in either frontend checkout. `npm pack next@16.3.3
--ignore-scripts --silent` in the local validation area obtained the exact
package. Its tarball SHA-512 matches the checked-in lockfile integrity. Read:

```text
package/dist/docs/01-app/01-getting-started/02-project-structure.md
package/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
package/dist/docs/01-app/03-api-reference/03-file-conventions/error.md
package/dist/docs/01-app/02-guides/testing/jest.md
```

Online official Next references were checked, but currently show `16.3.4`;
the exact packaged docs govern this draft's version-specific statements.

Run the retained extraction/render/validation commands from the validation
area (the helper scripts are local evidence, not application files):

```powershell
node extract.mjs
$cli = 'C:\Users\ofgar\AppData\Local\npm-cache\_npx\668c188756b835f3\node_modules\@mermaid-js\mermaid-cli\src\cli.js'
$svg = 'C:\Users\ofgar\.codex\worktrees\nextjs-module-diagram\docs\architecture\assets\nextjs-modules.svg'
node $cli -i nextjs-modules.mmd -o $svg -p puppeteer.json -w 1600 -H 1000 -b white -I hpc-nextjs-modules
node $cli -i nextjs-modules.mmd -o repeat.svg -p puppeteer.json -w 1600 -H 1000 -b white -I hpc-nextjs-modules
(Get-FileHash $svg).Hash -eq (Get-FileHash repeat.svg).Hash
node validate.mjs
git -C 'C:\Users\ofgar\.codex\worktrees\nextjs-module-diagram' diff --check
```

`extract.mjs` asserts exactly one Mermaid fence and extracts it unchanged.
`puppeteer.json` sets the local Chrome executable and headless mode.
The committed Mermaid block carries its theme, Arial font, layout settings,
deterministic IDs and seed; `-I` fixes the outer SVG ID. To reproduce elsewhere,
extract that fence to an `.mmd` file and use the same renderer versions/options
with a matching browser/font. Do not manually edit the generated SVG.

Validation covers Mermaid parse/render, expected eight nodes/eight drawn edges,
feature-group edge expansion and directed-cycle detection, node-label containment,
node overlap, SVG text clipping, accessible title/description, raster nonblank
pixels, and Markdown links. Repository source links are resolved against the
exact local Git objects (`git cat-file -e SHA:path`), including private sources;
this verifies target existence without relying on unauthenticated GitHub HTTP.
The three new official Next documentation links were opened successfully.
Pre-existing README web links are outside this change's link-validation claim.

Recorded draft results: SVG `1248 x 821`; eight nodes/eight drawn edges; zero
clipped labels or overlapping nodes; 16,277 dark raster pixels; seven local
links and 18 pinned repository links resolved; zero validator failures. Two
renders have the same SHA-256:
`DAABF61F0F7B58DB3D2BB8D9141D734E06D1418A82934288FACDDFCF66107270`.

The raster `nextjs-modules.png` and geometry/pixel/link results `validation.json`
are retained in the local validation area. The author visually inspected the
render at native size for readable text and unobstructed arrows. The diagram,
folder tree and responsibility table were cross-checked: four feature areas,
one UI layer, one Gateway client, no feature imports back into routes and no
frontend backend services. `git diff --check` and documentation-only scope
checks pass before freezing.

Application build/lint/tests were not run: no application code was changed and
the repo has no installed dependencies. This is not a claim of runtime API,
auth, a11y, or async Server Component test coverage.

## Open Decisions and Review Gate

Open before implementation: OpenAPI schemas/filter/pagination and series/event
relationship selection; login/logout/smoke endpoints; origin/cookie/CORS/CSRF
and allowed-return policy; progress/reset semantics; guest AIDA enablement;
JSON versus streaming; retention/deletion policy; rendering/caching/hosting.
Guest availability wording differs between persistence notes and system
contract section 7.1. It remains explicitly undecided; durable guest history
is not proposed. No consequential conflict was silently resolved in code.

Approved reviewer configuration: **gpt-5.6-sol / high**, expected usage
**Moderate**. Rationale: independent source reconciliation across product,
frontend and Gateway boundaries. Escalation: report consequential product/API
conflicts to the user; do not choose a different model or silently settle them.
Boundary: read-only draft/sources, report writes only in an assigned separate
review area; no app edits, remote writes, cloud activity or shared-checkout edits.

The current author environment exposes **no subagent-spawn tool** (including
no `fork_context=false` capability). Independent review therefore has not run;
it must not be represented by this author's checks. A new user-visible task
has not been created as a substitute. The final correction pass is reserved
until one fresh reviewer supplies its report. Draft completion does not mean
the entire requested review/correction workflow is complete.

Give the reviewer the frozen draft SHA and the source paths/revisions above,
not the author's reasoning history. Require direct reading of sources, SVG
inspection, severity-ranked actionable findings with file/line references and
an acceptable/needs-correction verdict. Check feature ownership, dependency
cycles, tree/diagram agreement, auth/API/data boundaries, source-grounded scope,
existing/proposed truthfulness, links and rendering. Preserve that report plus
an evidence-based agree/disagree disposition for each finding in the final
author pass; regenerate and inspect the SVG and locally commit once. No second
review round or publication is authorized by this handoff.
