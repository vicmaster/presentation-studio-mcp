# presentation-studio-mcp

[![CI](https://github.com/vicmaster/presentation-studio-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/vicmaster/presentation-studio-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.17-green)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/python-%3E%3D3.9-blue)](https://www.python.org/)

A local, production-grade engine for **generating, editing, auditing, previewing and reusing** professional `.pptx` presentations, exposed as an **MCP** server so agents like Claude Code or Codex can use it as a presentation backend.

Designed for brochures, sales proposals, case studies, executive decks, quarterly reviews and institutional presentations.

> **Open source friendly.** The project ships with the MagmaLabs brand and a
> neutral `acme` brand as examples, but anyone can use their own brands,
> templates and examples without forking the code. See
> [`docs/customization.md`](docs/customization.md) for the white-labeling guide.

---

## 1. What does this tool do?

1. Accepts a structured brief or a partial `deck_spec`.
2. Applies branding, layouts, visual rules and assets.
3. Processes images locally with Pillow (crop, resize, overlays, etc.).
4. Generates a real `.pptx` file with commercial quality.
5. Produces a rich preview manifest for agent review.
6. Runs heuristic audit rules (density, contrast, bounds, ...).
7. Lets you update specific slides without rebuilding the deck.
8. Extracts text and images from existing `.pptx` files for reuse.
9. Exposes everything as tools and resources over **MCP** (stdio).

Everything runs **locally**. No external services required.

---

## 2. Architecture

```
apps/
  mcp-server/      # MCP server exposed over stdio
  renderer/        # PptxGenJS renderer (layouts, themes, utilities)
  cli/             # CLI that runs the same pipeline without MCP
  asset-worker/    # Python/Pillow worker for image processing
packages/
  schema/          # Zod contracts + TypeScript types
  templates/       # Ready-to-use DeckTemplates (brochure, case-study, ...)
  core/            # Registries, deck builder, audit, extraction, assets
assets/
  brands/          # brand.json per brand (MagmaLabs and Acme included)
examples/
  brochure/        # brief + deck-spec + assets-plan
  case-study/
  proposal/
  quarterly-review/
  neutral-brochure/ # brand-neutral example using the Acme brand
tests/             # Vitest tests
```

The design follows three fundamental principles:

1. **Content vs render.** The agent decides what to say. The renderer decides geometry, spacing, typography and branding.
2. **Single source of truth**: the `DeckSpec`. The whole pipeline revolves around it.
3. **Reusable layouts**: each layout lives as an isolated module, registered in a registry.

See `docs/architecture.md` for more detail.

---

## 3. Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js ≥18.17, TypeScript (ESM), pnpm workspaces |
| PPTX render | [PptxGenJS](https://github.com/gitbrent/PptxGenJS) |
| Image processing | Python 3 + Pillow |
| Contract validation | Zod |
| Tests | Vitest (TS) + pytest (Python) |
| Lint / format | ESLint + Prettier |
| MCP | `@modelcontextprotocol/sdk` (with JSON-RPC stdio fallback) |

---

## 4. Installation

```bash
# 1. Clone the repo and enter the folder
git clone git@github.com:vicmaster/presentation-studio-mcp.git
cd presentation-studio-mcp

# 2. Install TypeScript dependencies
pnpm install

# 3. Install Python dependencies for the asset worker
cd apps/asset-worker
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ../..
```

> The Python worker is only required if you want to run `prepare_assets`. The core rendering pipeline (`render_deck`, `audit_deck`, `preview_deck`, `extract_from_pptx`, `update_slide`) works without Pillow.

---

## 5. Quick start

### 5.1 Run the MCP server

```bash
pnpm dev:mcp
```

This starts `@presentation-studio/mcp-server` over stdio. From any MCP-compatible client you will see the registered tools and resources.

### 5.2 Use the CLI

```bash
# Render an example deck
pnpm cli render --input examples/brochure/deck-spec.json --output tmp/brochure.pptx

# Audit it
pnpm cli audit --input examples/brochure/deck-spec.json

# Build a preview manifest
pnpm cli preview --input examples/case-study/deck-spec.json --output tmp/case-study-preview.json

# Extract content from an existing .pptx
pnpm cli extract --input tmp/brochure.pptx --output tmp/extracted

# Prepare assets with Pillow (requires the worker installed)
pnpm cli prepare-assets --input examples/brochure/assets-plan.json

# List templates and brands
pnpm cli list-templates
pnpm cli list-brands

# Validate a deck spec
pnpm cli validate-deck --input examples/proposal/deck-spec.json

# Scaffold your own brand or template
pnpm cli init-brand --id acme --name "Acme Inc" --primary "#0066FF"
pnpm cli init-template --id my-pitch --name "Pitch Deck" --output my-templates/pitch.json
```

---

## 6. What is a `deck_spec`?

A `deck_spec` is a JSON document that fully describes a presentation:

```json
{
  "meta": { "title": "...", "language": "en", "presentation_type": "brochure" },
  "brand": { "id": "acme", "primary_color": "#0066FF", ... },
  "theme": { "id": "light-corporate", "page_size": "LAYOUT_WIDE", "density": "balanced" },
  "assets": [ ... ],
  "slides": [
    { "id": "cover", "layout": "hero-cover", "title": "...", "images": [...] }
  ]
}
```

Required fields are validated with Zod. Any partial payload can be piped through `normalize_deck_spec`, which fills sensible defaults.

More details in `docs/deck-spec.md`.

---

## 7. Available layouts

15 layouts ready to use, each in its own module:

`hero-cover`, `section-divider`, `two-column-text`, `image-left-text-right`, `image-right-text-left`, `case-study-highlight`, `metrics-grid`, `logo-wall`, `quote-slide`, `closing-cta`, `timeline-slide`, `comparison-table`, `process-steps`, `testimonial-grid`, `capabilities-grid`.

If a deck asks for a layout that is not registered, the renderer falls back to `two-column-text` and emits a warning. See `docs/layouts.md` for the details of each layout.

### Adding a new layout

1. Create `apps/renderer/src/layouts/myLayout.ts` implementing the `LayoutRenderer` type.
2. Register it in `apps/renderer/src/index.ts` inside `createDefaultLayoutRegistry()`.

---

## 8. Brands and themes

Brands live under `assets/brands/<brand-id>/brand.json` and the registry loads them at startup. The project ships with two examples:

- **MagmaLabs** — real brand, also registered programmatically as the default.
- **Acme Inc** — neutral example brand for open source onboarding.

You can disable the built-in MagmaLabs brand and/or use your own by editing `presentation-studio.config.json` (see section 9 below).

Switching brands is as simple as using a different `brand.id` in your `deck_spec`. Themes (`magma`, `minimal`, `light-corporate`, `dark-enterprise`) are resolved by `ThemeRegistry`.

### Add a new brand (one command)

```bash
pnpm cli init-brand \
  --id mycompany \
  --name "My Company" \
  --primary "#FF6600" \
  --heading-font "Inter" \
  --body-font "Inter"
```

This creates `assets/brands/mycompany/brand.json` ready to use. You can edit it by hand afterward — the registry reloads it on every CLI / MCP invocation.

---

## 9. Customization and open source (white-label)

The project is designed to be reusable by anyone without forking the code. Everything MagmaLabs-related is **opt-in**.

Create a `presentation-studio.config.json` at the repo root:

```json
{
  "default_brand_id": "acme",
  "brands_dir": "assets/brands",
  "templates_dir": "my-templates",
  "load_builtin_brand": false,
  "load_builtin_templates": false,
  "organization_name": "Acme Inc"
}
```

- `load_builtin_brand: false` → does **not** register MagmaLabs at startup.
- `load_builtin_templates: false` → does **not** register the 7 built-in templates.
- `templates_dir` → directory of `*.json` templates to auto-load.

The full guide is in [`docs/customization.md`](docs/customization.md): how to add your own layouts and themes, how to remove every trace of MagmaLabs, how to scaffold brands/templates from the CLI, and how to deploy the project as your own product.

```bash
# Quick brand and template scaffolds
pnpm cli init-brand --id acme --name "Acme Inc" --primary "#0066FF"
pnpm cli init-template --id my-pitch --name "Pitch Deck" --output my-templates/pitch.json
```

The `examples/neutral-brochure/` sample uses the `acme` brand and is **free** of any MagmaLabs content.

---

## 10. Template system

A template describes a recommended slide flow for a particular kind of presentation. Templates are consumed by `plan_deck` to propose a complete outline starting from a Brief.

Built-in templates: `brochure-enterprise`, `brochure-premium`, `case-study-modern`, `sales-proposal`, `exec-update`, `quarterly-review`, `training-deck`.

You can also load your own templates as JSON (see section 9).

See `packages/templates/src/` for each built-in definition.

---

## 11. Pillow worker

The worker lives in `apps/asset-worker/` and exposes 9 operations: `resize`, `contain`, `cover_crop`, `normalize`, `overlay`, `montage`, `thumbnail`, `contact_sheet`, `pad_to_canvas`.

IO contract:

```json
// request
{ "operation": "cover_crop", "input_path": "/tmp/a.jpg", "output_path": "/tmp/b.png", "width": 1600, "height": 900 }
// response
{ "ok": true, "operation": "cover_crop", "output_path": "/tmp/b.png", "width": 1600, "height": 900, "warnings": [] }
```

The Node bridge (`PillowBridge`) spawns `python3` (override via `PPT_STUDIO_PYTHON`) and handles errors. Documented in `docs/asset-worker.md`.

---

## 12. MCP: tools and resources

### Tools (13)

| Tool | Description |
| --- | --- |
| `create_brief` | Validates / normalizes a Brief |
| `plan_deck` | Builds a DeckSpec skeleton from a Brief + template |
| `normalize_deck_spec` | Normalizes a partial deck into a strict one |
| `prepare_assets` | Runs an asset plan through the Pillow worker |
| `render_deck` | Generates a `.pptx` file |
| `preview_deck` | Produces a rich preview manifest |
| `audit_deck` | Runs the audit rules |
| `update_slide` | Updates (merge/replace) or inserts a slide |
| `extract_from_pptx` | Extracts text / media from an existing `.pptx` |
| `list_templates` | Lists registered templates |
| `list_brands` | Lists registered brands |
| `get_deck_spec` | Returns the session's current deck |
| `save_deck_spec` | Persists the current deck to disk |

### Resources

Resources are generated dynamically from whatever is currently registered:

- `brand://<id>/default` — one per registered brand kit
- `brand://default` — stable alias for the configured default brand
- `template://<id>` — one per registered deck template (built-in or JSON-loaded)
- `deck://current/spec` — in-memory DeckSpec for the session
- `deck://current/audit` — audit report for the current deck
- `deck://current/previews` — preview manifest for the current deck

See `docs/mcp-tools.md` for request / response examples.

---

## 13. Full examples

Each example in `examples/` includes `brief.json`, `deck-spec.json` and a README for assets.

```bash
pnpm cli render --input examples/brochure/deck-spec.json --output tmp/brochure.pptx
pnpm cli render --input examples/case-study/deck-spec.json --output tmp/case-study.pptx
pnpm cli render --input examples/proposal/deck-spec.json --output tmp/proposal.pptx
pnpm cli render --input examples/quarterly-review/deck-spec.json --output tmp/qbr.pptx
pnpm cli render --input examples/neutral-brochure/deck-spec.json --output tmp/acme.pptx
```

Open the resulting `.pptx` with PowerPoint, Keynote or LibreOffice Impress.

---

## 14. Tests

```bash
# TypeScript
pnpm test

# Python
cd apps/asset-worker
pytest
```

The TypeScript tests cover: schemas, normalization, audit rules (density, empty slide, unknown layout, missing CTA), slide updates, basic render with an assertion on the generated `.pptx`, a round-trip of the extractor, and the studio config system.

The Python tests cover: resize, cover_crop, contact_sheet and invalid input handling.

CI runs both suites plus a smoke render of every example deck on every push and PR.

---

## 15. Current limitations (intentional honesty)

- **No real slide thumbnails.** To keep the project simple and free of heavy dependencies (LibreOffice / headless PowerPoint), `preview_deck` returns a structured manifest instead of images. It is enough for an agent to review the deck, but it is not a substitute for looking at the rendered slide. Documented in `docs/architecture.md`.
- **`.pptx` extraction** recovers text, approximate titles, notes and media. It does NOT reconstruct layout, colors or typography. Realistic reuse, not a perfect round-trip.
- **Density and overflow estimates are heuristic.** They do not use a real typography metrics engine. They work well in practice but can be imperfect with very wide or very narrow fonts.
- **The MCP server** uses the official SDK when installed and falls back to a JSON-RPC 2.0 stdio loop otherwise. The fallback implements the four core methods (`tools/list`, `tools/call`, `resources/list`, `resources/read`) but does not support streaming or binary resources.
- **Pillow is invoked per process.** Each operation spawns a Python interpreter. For very large batches this has overhead; a persistent worker is a possible future optimization.

---

## 16. Recommended next steps

1. Integrate a headless engine (LibreOffice) to render real PNG previews per slide.
2. Add more industry-specific templates (fintech, retail, healthcare).
3. Validate available fonts on the host system before rendering.
4. Emit JSON Schemas from the Zod schemas for clients without Zod.
5. Persist MCP sessions across restarts (today the current deck is lost on restart).

---

## License

MIT — see [LICENSE](./LICENSE).
