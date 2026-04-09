# Customization & open source usage

`presentation-studio-mcp` ships with a built-in brand (MagmaLabs) and seven
built-in deck templates. Everything is **opt-in** — you can replace, disable
or augment them without forking the source code.

This guide shows how to use the tool as a white-label presentation engine for
your own brand.

## 1. The config file

Drop a `presentation-studio.config.json` at the repo root. Every field is
optional.

```json
{
  "default_brand_id": "acme",
  "brands_dir": "assets/brands",
  "templates_dir": "my-templates",
  "examples_dir": "my-examples",
  "load_builtin_brand": false,
  "load_builtin_templates": false,
  "organization_name": "Acme Inc"
}
```

| Field | Default | Purpose |
| --- | --- | --- |
| `default_brand_id` | `magmalabs` | Brand used when a deck omits `brand.id` |
| `brands_dir` | `assets/brands` | Directory scanned for `brand.json` files |
| `templates_dir` | *(unset)* | If set, every `*.json` inside is loaded as a DeckTemplate |
| `examples_dir` | `examples` | Informational only — used by docs & CLI output |
| `load_builtin_brand` | `true` | If `false`, the MagmaLabs brand is NOT registered |
| `load_builtin_templates` | `true` | If `false`, the seven built-in templates are NOT registered |
| `organization_name` | `presentation-studio-mcp` | Friendly name for docs and CLI output |

## 2. Using your own brand (5 minutes)

```bash
# Scaffold a brand
pnpm cli init-brand \
  --id acme \
  --name "Acme Inc" \
  --primary "#0066FF" \
  --secondary "#0A2540" \
  --heading-font "Inter" \
  --body-font "Inter"

# Verify it was loaded
pnpm cli list-brands

# Use it in a deck by setting `brand.id = "acme"` (or by making it the
# default via presentation-studio.config.json)
pnpm cli render --input examples/neutral-brochure/deck-spec.json --output tmp/acme.pptx
```

## 3. Using your own templates

Templates can be plain JSON files. Scaffold one:

```bash
pnpm cli init-template \
  --id acme-pitch \
  --name "Acme Pitch Deck" \
  --output my-templates/acme-pitch.json \
  --audience "Series A investors"
```

Then point the config at the directory:

```json
{ "templates_dir": "my-templates" }
```

Your template will show up in `pnpm cli list-templates` and the MCP
resource `template://acme-pitch` the next time the server loads.

## 4. Running with ONLY your own brand and templates

If you want a clean, MagmaLabs-free install (e.g. deploying as your own
product), use this config:

```json
{
  "default_brand_id": "acme",
  "load_builtin_brand": false,
  "load_builtin_templates": false,
  "templates_dir": "my-templates"
}
```

Then delete `assets/brands/magmalabs/` if you want the repo to look fully
yours. The `examples/` directory contains both MagmaLabs-flavored and neutral
(`examples/neutral-brochure/`) samples — keep whichever you prefer.

## 5. Adding your own layouts (requires a small fork)

Layouts are currently TypeScript modules (not JSON) because they touch the
render pipeline directly. To add one:

1. Create `apps/renderer/src/layouts/myLayout.ts` implementing the
   `LayoutRenderer` interface.
2. Register it in `apps/renderer/src/index.ts` inside
   `createDefaultLayoutRegistry()`.
3. Rebuild.

See `docs/layouts.md` and the 15 existing layouts in
`apps/renderer/src/layouts/` as references.

## 6. Adding your own themes

Same idea — `apps/renderer/src/themes/myTheme.ts` and register it in
`createDefaultThemeRegistry()`. Themes are small: they just translate the
brand colors into a `RenderContext.colors` bundle.

## 7. Deleting the MagmaLabs content entirely

The safest way to remove MagmaLabs from a fork:

1. In `presentation-studio.config.json`: `"load_builtin_brand": false`
2. Delete `assets/brands/magmalabs/`
3. Delete `examples/brochure/`, `examples/case-study/`, `examples/proposal/`,
   `examples/quarterly-review/` — or replace their `brand.id` fields.
4. Edit `README.md` to replace references to MagmaLabs with your
   organization name.

The rest of the project (schema, core, renderer, layouts, templates, tests,
MCP server) is brand-neutral.
