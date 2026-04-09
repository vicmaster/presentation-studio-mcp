# Brochure assets

This directory is reserved for source images referenced by `deck-spec.json`.

To use the bundled `deck-spec.json` as-is, no assets are required — the
renderer will emit placeholders for any missing images. To exercise the
Pillow pipeline, drop source files into `source/` and run:

```bash
pnpm cli prepare-assets --input examples/brochure/assets-plan.json
```
