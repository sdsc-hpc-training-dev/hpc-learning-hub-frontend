# Independent Review: HPC Learning Hub Next.js Architecture

**Verdict: acceptable. No required corrections found.** This is an assessment of the frozen documentation proposal, not implementation acceptance or authorization to publish.

Reviewed on 2026-09-03. Approved configuration: Sol/high; expected usage Moderate. The long-running-task handbook was read. Review remained read-only outside this review's output directory. No author conclusions, additional reviewers, implementation changes, branches, pushes, cloud jobs, or application test suite were used.

## Frozen Inputs

| Input | Exact revision and location |
| --- | --- |
| Author draft | `671c3719cab25a0d908b8939e2c858e4d40cef64`, `C:/Users/ofgar/.codex/worktrees/nextjs-module-diagram` |
| Frontend base | `67cbb3f24cbe3ca1f671e647d86421356a93c7ff`, same Git repository |
| Gateway | `fda21d619dcc5119f1133501bafa8cc7e800c7cf`, `C:/Users/ofgar/OneDrive/Documents/Interactive video/hpc-learning-hub-apigateway` |
| Design baseline | `deaf8e5371dd46fd525c0d668c49e3b50aa0aa46`, read from the existing isolated Git clone at `C:/Users/ofgar/.codex/tmp/nextjs-prototype-source` |

All author file/line references below refer to the frozen draft, read using `git show`. Reviewed changes: `docs/architecture/nextjs-modules.md`, `docs/architecture/assets/nextjs-modules.svg`, and the architecture links in `README.md`. The author's handoff was not read; its link target was checked for existence only.

## Required Findings

None. No P0-P3 defect requiring a correction was established against the supplied scope and pinned evidence. In particular, deferred deployment and HTTP details were not treated as defects in a documentation-only proposal.

## Evidence And Assessment

| Review area | Assessment and evidence |
| --- | --- |
| Ownership and imports | [Architecture:12](C:/Users/ofgar/.codex/worktrees/nextjs-module-diagram/docs/architecture/nextjs-modules.md:12) defines dependency arrows; lines 68-71 explicitly prohibit feature-to-feature and reverse imports and assign composition to routes/shell. The eight Mermaid edges, expanded to 14 edges for group dependencies, are acyclic. Folder, diagram and responsibility table agree on catalog, auth, learning, AIDA, UI and transport ownership. History correctly belongs to AIDA despite its My Learning URL. This validates the proposed graph, not nonexistent implementation imports. |
| API mapping and scope | [Architecture:170](C:/Users/ofgar/.codex/worktrees/nextjs-module-diagram/docs/architecture/nextjs-modules.md:170) maps public catalog, personal learning and AIDA to the surfaces in Gateway system contracts sections 4.2, 4.3 and 7.1. Programs map to event series, events to editions, recordings to material resources. No unsupported `/programs` API or event-detail endpoint is asserted. Gateway contracts section 1, implementation brief, ingestion specification and router verdict support the exclusions: no frontend database/storage/model access, token exchange, role authority, ingestion or classifier implementation; no submission, GraphRAG, Neo4j or Docusaurus expansion. |
| Next.js boundaries | [Architecture:147](C:/Users/ofgar/.codex/worktrees/nextjs-module-diagram/docs/architecture/nextjs-modules.md:147) and [Architecture:195](C:/Users/ofgar/.codex/worktrees/nextjs-module-diagram/docs/architecture/nextjs-modules.md:195) correctly describe Server Component defaults, client import boundaries, serializable props, route loading/error boundaries, and the root-layout exception. Exact `next@16.3.3` bundled docs confirm `retry` became stable in 16.3.0; this is not an erroneous substitution for older `reset` guidance. The Jest limitation for async Server Components also matches the bundled guide. |
| Auth and private state | [Architecture:203](C:/Users/ofgar/.codex/worktrees/nextjs-module-diagram/docs/architecture/nextjs-modules.md:203) separates credential-free public server reads from browser session requests; prohibits ambient/current-user transport state and shared caching of personal responses; reserves authenticated server forwarding for a reviewed adapter. Lines 215-229 preserve Gateway callback/session/role authority, default LEARNER, HttpOnly cookies, and explicit origin/CORS/CSRF/logout/return-URL prerequisites. Neither the folder tree nor role display is presented as authorization. No hidden credential flow or required cache leak is introduced by this proposal. |
| Journeys and failure states | The pinned functional stories, personas, design decisions, July 16 findings, July 28 meeting and quality scenarios support public discovery, beginner curated paths, resources, events/series, consistent AIDA access and optional personal continuity. `v1.0.0/material.js`, `programs.js`, `learning-paths.js` and `saved.js` substantiate the cited journeys, not their production implementation. [Architecture:185](C:/Users/ofgar/.codex/worktrees/nextjs-module-diagram/docs/architecture/nextjs-modules.md:185) appropriately avoids unsupported freshness, links and timestamps. Lines 240-270 preserve canonical context, all four answer modes, nullable citation targets, abstentions, local request failure/retry behavior and accessibility responsibilities. No material in-scope journey lacks an owning feature. |
| Existing versus proposed | [Architecture:274](C:/Users/ofgar/.codex/worktrees/nextjs-module-diagram/docs/architecture/nextjs-modules.md:274) matches the base tree: effectively empty home page, root layout/CSS, heading smoke test and listed tooling, without domain features or Gateway client. Manifest and lock agree on Next 16.3.3 / React 19.2.8. `types/routes.d.ts` is generated and describes only `/`. Root `@/*` alias, Jest coverage omission of `features/`, and explicit Knip project globs were checked. README lines 25-29 accurately label the architecture as proposed. |
| Diagram and references | Independently parsed and rendered Mermaid, then inspected both the frozen SVG raster and the independent raster. Both have viewBox `0 0 1248 821`, eight nodes and eight visible edges. Node labels fit their boxes; no clipping, overlap or misleading reverse arrow was observed. Group arrows originate at the feature enclosure, consistent with the nearby legend. Desktop and 960px captures are readable; phone fit-to-width needs zoom. All 22 checked relative/immutable Git references resolve; the three cited official Next documentation URLs also resolve. |

Gateway evidence read at the pinned revision: `docs/system-contracts-v0.1.md`, `docs/sdsc-learning-hub-persistence-class-diagram.md`, `docs/intern-implementation-brief.md`, `docs/specs/ingestion-worker.md`, and `docs/aida-router-architecture-verdict.md`. Design evidence also included the pinned account/QA notes; their historical version labels and simulated authentication are not production evidence.

## Optional Suggestions

- **O-01: Make the session-change handoff explicit.** [Architecture:229](C:/Users/ofgar/.codex/worktrees/nextjs-module-diagram/docs/architecture/nextjs-modules.md:229), with lines 68-71 and 203-214. The intended privacy invariant is correct. A short implementation note could assign shell-level identity-change propagation to learning/AIDA via props or slots, including clearing private state and ignoring late responses from a previous session. Test sign-out, expiry and account switching. This would make the existing requirement more actionable without adding cross-feature imports or a state framework; no unsafe implementation exists here to classify as a defect.
- **O-02: Preserve a zoomable diagram presentation.** [SVG:1](C:/Users/ofgar/.codex/worktrees/nextjs-module-diagram/docs/architecture/assets/nextjs-modules.svg:1), linked at [Architecture:66](C:/Users/ofgar/.codex/worktrees/nextjs-module-diagram/docs/architecture/nextjs-modules.md:66). At 390px fit-to-width the labels become too small to read comfortably. Keep the direct SVG link and prose/folder alternative; a future documentation host should allow zoom or horizontal viewing rather than force a thumbnail. No extra feature nodes or mandatory diagram redesign is warranted.

## Already-Open Decisions

These are implementation prerequisites or known source limitations, not required review fixes:

- OpenAPI DTOs, query/pagination names, event/series selection relationships, auth/logout/smoke endpoint details and idempotency behavior.
- Deployment origin topology, cookie scope/SameSite policy, credentialed CORS, CSRF controls and permitted return URLs; rendering, hosting and caching strategy.
- Progress update/reset semantics, without promising timestamp resume; player integration remains unestablished.
- Guest AIDA availability: persistence notes say account-free transient AIDA, while system contracts section 7.1 says it may be supported. The draft explicitly records this consequential difference at lines 255-260 instead of choosing silently. Authenticated owned history is unambiguous.
- Answer transport and retention/deletion periods. The persistence model's cascade-delete direction remains subject to the adopted retention policy; the draft does not promise a conflicting policy.
- Future integration/browser testing for async Server Components, actual accessibility verification and usable contract fixtures. No such coverage or production readiness was proved here.

Older requests for hard-coded curated paths, Docusaurus, administration/submission and material freshness fields are superseded or constrained by the user's fixed scope and Gateway contracts. They are not grounds to restore those features in this diagram.

## Verification Record

Working directory for reviewer scripts: `C:/Users/ofgar/.codex/worktrees/nextjs-diagram-independent-review`.

1. Read the handbook. Used `git show <pinned-sha>:<file>` throughout; `git ls-tree -r --name-only <base>` verified the frontend inventory. `git diff <base> <draft> -- README.md` verified only the added architecture links. Initial and final author-tree `git status --porcelain=v1` were empty; HEAD remained the frozen SHA.
2. Ran `node verify.mjs`. It independently extracted the frozen Mermaid and SVG, checked all relative links and immutable GitHub revision/path references with `git cat-file -e`, parsed manifest/lock versions, expanded the group dependency edges and checked for cycles. Result: 22 references resolved, no cycles, versions agree. The cached Next archive SHA-512 exactly matches the base lockfile integrity.
3. Compared `tar -xOf C:/Users/ofgar/.codex/tmp/nextjs-diagram-validation/next-16.3.3.tgz package/<path>` against local extracted package files. `package.json` and the exact bundled project-structure, server/client, error and Jest guides all matched byte-for-byte. The archive was reused as primary package evidence, not the author's validation output.
4. Independently rendered with the existing local Mermaid CLI 11.17.0 and installed Chrome; no dependency installation or source configuration changes:

   ```powershell
   node 'C:\Users\ofgar\AppData\Local\npm-cache\_npx\668c188756b835f3\node_modules\@mermaid-js\mermaid-cli\src\cli.js' -i frozen.mmd -o independent-render.svg -p puppeteer.json -w 1800 -H 1200 -b white
   node render-check.mjs
   ```

5. `render-check.mjs` opened the actual frozen and newly rendered SVGs in headless Chrome, recorded text/box geometry and marker paths, and captured PNGs. Visual inspection covered both 1800px captures plus frozen SVG at 960px and 390px. The two 1800px PNG files are byte-identical. SVG hashes differ because the independent CLI uses the default `my-svg` identifier namespace; recorded node coordinates, text and edge paths agree, with only identifier/marker namespace differences in the geometry records. Zero node-label containment failures; title/description present; no `foreignObject` labels.
6. Ran `git diff --check <base> <draft> -- README.md docs/architecture/nextjs-modules.md docs/architecture/assets/nextjs-modules.svg`: passed. Opened official [project structure](https://nextjs.org/docs/app/getting-started/project-structure), [error boundary](https://nextjs.org/docs/app/api-reference/file-conventions/error) and [server/client](https://nextjs.org/docs/app/getting-started/server-and-client-components) links. Live docs display 16.3.4; exact bundled 16.3.3 documentation governed version judgments.

Reviewer tool hiccups: the first screenshot script invocation needed a Windows ESM import changed to a `file:///` URL; it then passed. One image-view call used an incorrect PNG filename, then the actual artifact was opened successfully. Neither affected source or the final checks. No full app build/test run, live Gateway call, login flow, product UI accessibility test, or GitHub publication check was performed.

Artifacts: `static-verification.json`, `render-verification.json`, `frozen-numbered.txt`, `frozen.mmd`, `frozen.svg`, `independent-render.svg`, `frozen-1800.png`, `independent-render-1800.png`, `frozen-960.png`, `frozen-390.png`, and the two reviewer scripts/config in this directory. Frozen SVG SHA-256: `daabf61f0f7b58db3d2bb8d9141d734e06d1418a82934288facddfcf66107270`.

The single independent review is complete. Any correction or publication decision belongs to the coordinating task; this review initiates no further review loop.
