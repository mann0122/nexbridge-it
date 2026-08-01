# design/

Visual R&D. Things being evaluated for the website that have **not** been adopted yet.

This folder is deliberately outside `website/`, so nothing here is part of the Astro build and
nothing here ships. It is also outside `docs/`, so `npm run kb` does not treat these files as
graph nodes — no frontmatter required.

The written authority on the visual world stays `DESIGN.md` at the repo root, pinned by
`docs/02-brand.md`. This folder does not compete with it: an experiment only becomes design
system when it lands in `DESIGN.md` with a `D-` entry in `docs/05-decisions.md`.

## Contents

| | |
|---|---|
| `particle-field/` | Scroll-morphing 3D particle field. **Shipping** as the homepage `Wandlung` stage (D-026 → D-027 → D-028). Read `particle-field/STUDY.md` before changing it — "What the first attempt taught us" is load-bearing. |

## Working rule

Anything promoted out of here into `website/` goes through the normal gates: `design-critic` for
UI, `copywriter-de` for any German that becomes customer-facing, `qa-reviewer` before commit. A
demo passing in this folder proves the idea, not the implementation.
