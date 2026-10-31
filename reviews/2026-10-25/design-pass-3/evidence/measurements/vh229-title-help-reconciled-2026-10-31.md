<!-- markdownlint-disable -->
# VH-229 — the title's "?": the table reconciled

Added at the blind check, which found the table adds re-walks to the cells they replace. [The table](vh229-title-help-2026-10-31.md) and its records stand as placed, not rewritten; its notes already named `c2` and `c3` as the readings. This page, by [`reconcile.mjs`](vh229-records-2026-10-31/vh229-reconcile.mjs.txt) from those records alone, states the readings with each later re-walk replacing the earlier cell. No code changed and nothing was re-walked for it.

## Scenario cells

636 cells before and 636 after, in S-03 and S-141 to S-144; **598 reached on each side, the same cells; 578 unmoved**; 0 before-only, 0 after-only. No cell's reach moved. **No instrument or row newly fails** (0 moves to fail). The table's 841 and 858, its 17 after-only cells and its S-143 "undefined →" rows are the re-walks counted twice. Later groups replaced 205 earlier rows before and 222 after; of those within `a`, `b` and `c`, S-144's repeats, 0 differed in outcome.

| What moved | Cells |
| --- | --- |
| targets: fail → pass | 55; S-03 55 |
| type: fail → pass | 58; S-03 58 |
| formatTip: fail → not-applicable | 58; S-03 58 |
| row "the owner's five promises, in order": fail → pass | 58; S-03 58 |
| targets: fail → cannot-determine | 3; S-03 3 |

All of it is S-03, read closed: its `type`, `formatTip` and most of `targets` improve because the format "?" is not painted with the panel closed, not because that "?" changed; "the five promises" passes since the panel is `.lede`.

Failing alike on both sides:

| Instrument or row | Cells |
| --- | --- |
| targets | 540; S-144 136, S-141 136, S-142 136, S-143 132 |
| type | 540; S-144 136, S-141 136, S-142 136, S-143 132 |
| formatTip | 404; S-141 136, S-142 136, S-143 132 |
| row "the "?" 44 x 44 after its promise's text; the tip under it, " | 136; S-141 136 |
| row "Tab: closed, focus on Video type's checked radio" | 136; S-142 136 |
| row "Shift+Tab: closed, focus on Page language's radio in English" | 136; S-142 136 |
| overflow | 99; S-03 3, S-144 20, S-141 20, S-142 20, S-143 36 |
| row ""About the video format" 44 x 44, collapsed, controlling #fo" | 58; S-03 58 |
| row "Tab from the top: skip link, Page language, (the notice's li" | 58; S-03 58 |
| row "nothing off the page with the tip open" | 20; S-144 20 |
| focus | 8; S-03 4, S-143 4 |

**Not reached, 38 cells, the same on each side, no link claimed:** all at w375 and a 32 px font: S-03 2, S-144 8, S-141 8, S-142 8, S-143 12. The phone emulation widens to the page's overflow and the walker's window check refuses them (wish VH-217.4).

## States probe

Genuine readings: **3888 before, 5832 after**; 144 error rows on each side (the onset's, for the empty fixture folder) set aside, `states2` re-reading them. The 1944 after-only readings are the title's "?", which the before does not have (1944 of `about`). Of the 3888 on both sides, 3692 unmoved; `tip.top` in 196, `tip.bottomOfTarget` in 196: the format tip's place on the page, its gap under its "?" kept. The table's 4,032 and 5,976 count the error rows.

## Provenance of the before's re-walks

`walk.sh` passes the walker no `APP_ROOT`, so the manifests of `before-c2` and `before-c3` fingerprint the walker's own checkout, the build, not the temporary worktree the server ran from: dirty true, e6e6ed6c87d4cf6e, on 8 manifests. Their commit is right and their `dirty` and diff fields describe the wrong tree. What shows the before was served: `conditions.txt` read the worktree, diff hash `da39a3ee5e6b4b0d`, 0 lines of status; and 144 of 144 page probe readings in those groups have no "?" (`missing` holds `about`). The worktree was removed after, so this is the record's word and the page's own reading, stated as such. `before-states2` has no manifest and the same conditions.

## Names

Three of the records were renamed from `.mjs` to `.mjs.txt` at the close, content and sha1 unchanged, because the gate lints `.mjs` and they carry two unused-name and global-name errors from their walker lineage: `vh229-shots`, `vh229-states`, `vh229-states-onset`, as `vh217-states2.mjs.txt` was. `vh229-table-notes.md` likewise took `.md.txt`, since the docs lint reads it. The table and `sources.txt` name them as they were walked.

## Power and load

A before and its after match in power mode, mode 2 throughout. `a`, `b` and `c`: AC both sides, at materially different load (median 11 to 17 against 7 to 10). `states`: AC both sides, median 5.99 before and 3.78 after. `c3` and `states2`: battery above 50% both sides, comparable. `c2`: before AC then battery, after battery, and its before lost Chrome at a load peak of 150 in `dark-font32`, read `c3` for those 18. So the static readings stand, and no timing or performance conclusion is drawn from these walks.

