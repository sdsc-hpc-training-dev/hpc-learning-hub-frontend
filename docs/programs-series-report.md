# READY FOR RELEASE OWNER

Date: 2026-10-09. Programs & Series descriptions, accessible expansion, and series-specific server pagination are implemented locally. No deployment, push, merge, pipeline modification, learning-path modification, or database write was performed by this task.

## Isolation and review

- Frontend branch: `codex/programs-series-20261009`.
- Worktree: `C:\Users\ofgar\OneDrive\Documents\Interactive video\_prod_readiness\2026-10-09\programs-series-work\hpc-learning-hub-frontend`.
- Local readiness baseline commit: `abecca312faec61ae13948a15bfa1b7e762ee780`. It preserves the original checkout's dirty readiness changes; review/cherry-pick only the subsequent feature commit, not this baseline commit.
- Gateway worktree: sibling `hpc-learning-hub-apigateway`, same branch name, baseline `23ed34406fcaa68e8efcdad5ffaabc3cbca4b6e7`. No Gateway source changes were needed.
- Evidence and scripts: `C:\Users\ofgar\OneDrive\Documents\Interactive video\_prod_readiness\2026-10-09\reports\programs-series`.
- Original dirty readiness checkouts and active local containers on ports 18080/18081 were not modified. Local preview uses its own loopback port 18082.

## Result and exact files

Cards now have a series-specific description. Collapsed copy includes its ellipsis within a 200-character limit; native Show more/Show less buttons expose `aria-expanded` and `aria-controls`. A labeled, keyboard-focusable region reserves a fixed 10rem text area, so expansion does not resize cards. Long descriptions can scroll at narrow widths or larger text sizes.

The selected detail section uses the same full description. Explore these materials opens `/programs/materials?program=<series-id>&page=1`. Page links preserve the series and use normal history navigation. Unknown series never load the unfiltered catalog. Zero results show no pagination; stale out-of-range links redirect to the last page (page one for an empty series).

Both previews and the materials view request `pageSize=6` from the existing Gateway. Ordinary page loads make one series-list request and one materials-page request. Stale page links require at most one additional bounded materials request. No all-materials loader or client-side pagination is used here. Distinct material IDs with identical titles remain visible, preserving accurate totals and every associated record.

| File | Change |
|---|---|
| `features/programs/descriptions.ts` | Six paraphrased descriptions, source URLs, honest fallback for unknown names; names rather than snapshot IDs identify copy |
| `features/programs/ProgramDescription.tsx` | 200-character collapsed text and accessible stable-size expansion |
| `features/programs/ProgramsView.tsx` | Specific card/detail copy and filtered Explore link |
| `features/programs/api.ts` | Bounded Gateway pages, URL builder, page parsing, stale-page clamp; shared material normalization |
| `features/programs/SeriesMaterialsView.tsx` | Series description, six cards, accurate totals/page counts, previous/next and detail-return links |
| `app/programs/materials/page.tsx` | Dynamic server route, direct-link query state, canonical page redirect, unavailable/error states |
| `app/globals.css` | Fixed description region, reserved button space, keyboard focus outline |
| `components/Navbar.tsx` | Programs drill-down retains Programs & Series active navigation rather than matching the word materials |
| `features/training-library/MaterialCard.tsx` | One semantic attribute: `role="group"` on the existing labeled topic row; needed to eliminate the accessibility violation in reused series cards |
| `features/programs/__tests__/api.test.ts` | Request budgets, filter encoding, deep-linked pages, totals, clamping, zero/unknown/error behavior |
| `features/programs/__tests__/ProgramsView.test.tsx` | Specific descriptions, filtered Explore link, selected and empty states |
| `features/programs/__tests__/ProgramDescription.test.tsx` | Six verified descriptions, abbreviation expansions, 200-character boundary, controlled toggle/region, short/unknown copy |
| `features/programs/__tests__/SeriesMaterialsView.test.tsx` | Six cards, counts, page links, boundaries, empty/unknown views |
| `features/programs/__tests__/SeriesMaterialsPage.test.tsx` | Direct-link query parsing, redirect, unknown series and service error |
| `components/__tests__/Navbar.test.tsx` | Programs materials route active-link regression |
| `docs/programs-series-report.md` | This handoff |

## Authoritative description sources

All descriptions are paraphrases. Verified expansions are Cyberinfrastructure-Enabled Machine Learning; Comprehensive Learning for End-users to Effectively Utilize Cyberinfrastructure; Triton Shared Computing Cluster; and San Diego Supercomputer Center. The database alias “Computing in Machine Learning” is not a verified CIML expansion and is not used in UI copy.

| Catalog series | Primary sources and interpretation |
|---|---|
| Advanced Computing Series | [Advanced HPC/CI Webinars](https://www.sdsc.edu/education/training-programs/Advanced-HPC-CI-Webinars.html), [On-Demand Learning](https://www.sdsc.edu/education/on-demand-learning/index.html). The named June/September Advanced Computing sessions also occur in the Advanced HPC/CI schedule; the catalog-name mapping is an inference supported by these shared session titles. |
| CIML | [SDSC CIML](https://www.sdsc.edu/education/training-programs/CIML.html), [CIML project](https://ciml.sdsc.edu/). Verified expansion and scaling ML from local resources to HPC. |
| COMPLECS | [SDSC COMPLECS](https://www.sdsc.edu/education/training-programs/COMPLECS.html). Verified expansion and practical supercomputer-user skills. |
| SDSC Webinars | [On-Demand Learning](https://www.sdsc.edu/education/on-demand-learning/index.html), [SDSC FY2019–20 annual report](https://www.sdsc.edu/_files/docs/annual_report_fy2019-20_web.pdf). This is the catalog umbrella for historical HPC training webinars; topics are supported by the named recordings. |
| Summer Institute | [Training Programs](https://www.sdsc.edu/education/training-programs/index.html), [SDSC Summer Institute 2025 repository](https://github.com/sdsc/sdsc-summer-institute-2025). Introductory/intermediate HPC/data science and hands-on training. |
| TSCC Workshop Series | [On-Demand Learning](https://www.sdsc.edu/education/on-demand-learning/index.html), [SDSC HPC systems](https://www.sdsc.edu/services/hpc.html). Verified TSCC expansion and topics from TSCC 101, transition, Python and Jupyter workshops; exact catalog umbrella name is retained. |

## Every displayed series audited

Active snapshot: `snapshot-v3-20260805T002229Z`; 530 training material records. Read-only repeatable-read transactions and all six-record Gateway pages were compared using exact material IDs. The initial capture at 2026-10-09 16:12:54 PDT matched all 120 frozen source snapshot INSTANCE_OF edges to database relationships. No importer/query loss or cross-series IDs were found. Missing links and misclassification already existed in the source associations.

The separate CIML/TSCC repair task changed the live database during verification. The before/after captures are retained separately. This task performed zero database writes and consumes the updated contract normally.

| Series (ID) | Initial materials | After separate repair | Evidence / remaining recommendation |
|---|---:|---:|---|
| Advanced Computing Series (`53000006`) | 0 | 0 | Four existing editions/materials lack series links; the primary Advanced HPC/CI schedule confirms the February–May 2026 titles. Review editions `10000153`, `10000155`, `10000179`, `10000184` and materials `20000153`, `20000155`, `20000179`, `20000184`. |
| CIML (`53000003`) | 0 | 7 | Seven existing CIML editions were assigned to Summer Institute. Separate task has reassigned them; Gateway pages now return all seven. No independent repair here. |
| COMPLECS (`53000002`) | 54 | 54 | All 54 named COMPLECS candidates are linked; exact Gateway IDs match database associations. No missing-link evidence found by the documented rule. |
| SDSC Webinars (`53000004`) | 39 | 39 | Fourteen existing records with SDSCWebinar/CometWebinar source identities have no links. Exact IDs, titles and source files are in `association-evidence.md` and JSON recommendations. Two October GPU records have the same title but distinct source/material IDs; curator review must preserve identity rather than silently deduplicate. |
| Summer Institute (`53000001`) | 37 | 30 | Initial count included seven CIML materials; separate repair leaves 20 editions / 30 materials. All remaining associated IDs appear across Gateway pages. |
| TSCC Workshop Series (`53000005`) | 0 | 10 | Separate task linked ten workshop/training editions. One remaining candidate is the TSCC User Group Meeting, edition `10000442`, material `20000442`; its inclusion requires a taxonomy decision, not an automatic repair. |

Durable follow-up: the association owner should curate the four Advanced Computing and fourteen webinar candidates against the frozen source records, decide TSCC User Group membership, and repair the upstream inference/curation separately. Observed `infer_series_id` selects the first substring match, so a generic Summer Institute match can win before specific CIML text; compact source IDs such as SDSCWebinar/TSCCworkshop do not match aliases containing spaces. Prefer explicit reviewed assignments and specific normalized aliases over ordering-dependent broad substring matches; add upstream regression fixtures for the exact IDs. Do not compensate with fuzzy series matching in the UI or Gateway. No pipeline files were edited in this task.

## Verification and limits

- Frontend full suite: 20 suites / 95 tests passed before the final accessibility/navigation attributes; final affected-suite pass: 12 suites / 74 tests (includes programs, reused cards, navbar and route pages).
- Gateway existing training-library contract suite: 25 tests passed, including snapshot scoping, filtering and pagination. No Gateway implementation changes.
- TypeScript, scoped ESLint with zero warnings, supporting navbar/card ESLint, and `git diff --check` passed. Optimized Next.js webpack build passed and includes the dynamic `/programs/materials` route.
- Browser verification: built local app at 1440×1000, 390×844 and 320×844. Enter/Space expansion, focus retention, fixed card dimensions, no horizontal overflow, direct links/reload, history back, detail return, six-record pages, three-record webinar last page, one-record CIML last page, four-record TSCC last page, stale-page redirect, and zero/unknown states. Exact displayed IDs matched the timestamped Gateway audit.
- Desktop/mobile screenshots and axe WCAG 2 A/AA + 2.1 AA results are retained in `reports/programs-series`. New controls and reused cards have zero reported violations. Contrast entries marked incomplete concern decorative `aria-hidden` arrows; readable link text passes the automated contrast rule. Screenshots were visually reviewed. A live screen-reader session was not run; accessible names, roles, control relationships, focus and keyboard behavior were verified instead.
- The audit identifies source-backed candidates; it does not certify every possible external material is represented. Same-title records are kept, and taxonomy ambiguity is disclosed. No data association edits, Azure deployments, pushes or merges are part of this deliverable.

Evidence files: `pre-repair-audit.json`, `current-audit.json`, `association-evidence.md`, `association-recommendations.json`, `current-reconciliation.json`, `browser-results.json`, `final-tests.log`, `final-browser.log`. Scripts: `audit-current.cjs`, `reconcile.py`, `browser-check.cjs`, `local-build-preview.cjs`. Review the current reconciliation for repaired versus unresolved candidates; the initial recommendations deliberately remain frozen.

## Integration and rollback

The release owner should review the feature commit against `abecca3`, then apply that commit or its diff to their isolated readiness branch. Do not cherry-pick the baseline-preservation commit. Existing Training Library work may overlap `app/globals.css`, `components/Navbar.tsx`, `components/__tests__/Navbar.test.tsx`, and `features/training-library/MaterialCard.tsx`: retain the release owner's newer changes while applying only the fixed description styles, Programs route detection and topic-row role. Re-run the focused tests, build and browser check against the integrated revision. No Gateway/data migration is required. Deploying or publishing remains outside this task.

Rollback consists of reverting the feature commit on the release-owner integration branch, preserving independently integrated changes where conflicts arise. It has no database rollback; the separate CIML/TSCC association repair is independently owned. `handoff.json` in the evidence directory records the exact final commit and baseline.
