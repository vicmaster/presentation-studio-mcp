# Neutral brochure example

This example is a **brand-agnostic** starting point for anyone forking
`presentation-studio-mcp` to use with their own brand.

It uses the bundled `acme` brand (`assets/brands/acme/brand.json`) so you can
run the full pipeline without any MagmaLabs content.

Try it:

```bash
pnpm cli render --input examples/neutral-brochure/deck-spec.json --output tmp/acme.pptx
open tmp/acme.pptx
```

To make it yours:

1. `pnpm cli init-brand --id mybrand --name "My Brand" --primary "#FF0066"`
2. Edit `assets/brands/mybrand/brand.json` as needed.
3. Copy `examples/neutral-brochure/deck-spec.json` to a new file and swap
   `"brand"` with your own id.
4. Re-run `pnpm cli render ...`.
