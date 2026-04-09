# MCP Tools & Resources

## Tools

### create_brief

Input (JSON):

```json
{
  "title": "Brochure Comercial MagmaLabs",
  "goal": "ventas",
  "audience": "clientes enterprise",
  "language": "es",
  "presentation_type": "brochure",
  "max_slides": 12,
  "key_messages": ["..."],
  "brand_id": "magmalabs"
}
```

Output: `{ brief: Brief }` con defaults aplicados.

### plan_deck

Input: `{ brief: Brief, template_id?: string }`
Output: `{ deck: DeckSpec, outline: [...] }`

Construye un deck skeleton con slides, layouts y notas (no llena contenido). La slide actual se guarda como "current deck".

### normalize_deck_spec

Input: `{ deck: object, default_brand_id?: string, set_as_current?: boolean }`
Output: `{ deck: DeckSpec, warnings: string[] }`

Útil para convertir cualquier JSON parcial en un deck válido.

### prepare_assets

Input: `{ plan: { operations: AssetOperation[], base_dir?: string, defaults?: {...} } }`
Output: `{ manifest: AssetManifest, operation_results: AssetOperationResult[], warnings: string[] }`

Ejemplo:

```json
{
  "plan": {
    "base_dir": "examples/brochure/assets",
    "operations": [
      { "operation": "cover_crop", "input_path": "source/hero.jpg", "output_path": "processed/hero.png", "width": 1920, "height": 1080 }
    ]
  }
}
```

### render_deck

Input: `{ deck?: DeckSpec, output_path: string, base_dir?: string }`
Output: `{ output_path: string, slide_count: number, warnings: string[] }`

Si omites `deck`, usa el deck actual de sesión.

### preview_deck

Input: `{}`
Output: `{ manifest: PreviewManifest }`

### audit_deck

Input: `{ base_dir?: string }`
Output: `{ report: AuditReport }`

### update_slide

Input: `{ slide: SlideSpecUpdate, mode?: "merge" | "replace" }`
Output: `{ action: "updated" | "inserted", deck: DeckSpec }`

### extract_from_pptx

Input: `{ pptx_path: string, output_dir: string, extract_media?: boolean }`
Output: `{ result: ExtractionResult }`

### list_templates / list_brands

Input: `{}`
Output: `{ templates: [...] }` / `{ brands: [...] }`

### get_deck_spec / save_deck_spec

- `get_deck_spec`: devuelve el deck actual.
- `save_deck_spec`: `{ output_path: string, deck?: DeckSpec }` → escribe a disco.

## Resources

Todos los recursos devuelven `application/json`:

| URI | Descripción |
| --- | --- |
| `brand://magmalabs/default` | Brand kit MagmaLabs completo |
| `template://brochure/enterprise` | DeckTemplate brochure enterprise |
| `template://case-study/modern` | DeckTemplate case study moderno |
| `template://proposal/sales` | DeckTemplate sales proposal |
| `template://quarterly/review` | DeckTemplate QBR |
| `deck://current/spec` | Current in-memory DeckSpec |
| `deck://current/audit` | Audit report del deck actual |
| `deck://current/previews` | Preview manifest del deck actual |
