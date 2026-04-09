# DeckSpec

El `DeckSpec` es el documento central que describe una presentación. Todos los tools trabajan sobre él.

## Estructura

```ts
DeckSpec = {
  meta: DeckMeta,
  brand: DeckBrandRef,
  theme: DeckTheme,
  assets: AssetRef[],
  slides: SlideSpec[]
}
```

### meta

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `title` | string | Título del deck |
| `subtitle` | string? | Subtítulo opcional |
| `language` | string | `"es"`, `"en"`, etc. Default `"es"` |
| `presentation_type` | string | `"brochure"`, `"case-study"`, `"sales-proposal"`, etc. |
| `author` | string | Default `"presentation-studio-mcp"` |
| `version` | string | Default `"1.0.0"` |
| `created_at` / `updated_at` | string | ISO timestamps |
| `tags` | string[] | Libres |

### brand (DeckBrandRef)

Una copia denormalizada del brand kit. Incluye colores principales, fuentes y paths a logos. Se usa en el renderer para colorear todo.

### theme (DeckTheme)

| Campo | Tipo | Default |
| --- | --- | --- |
| `id` | string | `"magma"` |
| `page_size` | `LAYOUT_WIDE` / `LAYOUT_STANDARD` / `LAYOUT_16x10` | `LAYOUT_WIDE` |
| `density` | `minimal` / `balanced` / `dense` | `balanced` |
| `background_style` | `light` / `dark` / `accent` | `light` |
| `show_footer` | boolean | `true` |
| `show_page_numbers` | boolean | `true` |
| `footer_text` | string? | Opcional |

### slides (SlideSpec[])

Cada slide contiene `id`, `layout` y campos opcionales usados por el layout:

- `title`, `subtitle`, `kicker`, `body` (texto base)
- `bullets` (lista de bullet points)
- `items` (para layouts tipo grid: label + description)
- `metrics` (label + value + detail)
- `quote`, `quote_author`
- `images`, `logos` (arrays de AssetRef)
- `background` (color, estilo, imagen)
- `cta` (label + url/email/contact)
- `notes` (speaker notes)
- `style_overrides` (colores puntuales)
- `layout_options` (align, density, columns, etc.)
- `hidden` (excluir de render)

Los campos que un layout no necesita se ignoran silenciosamente. Los que sí necesita pero están vacíos producen warnings durante audit/render.

## Ejemplo mínimo

```json
{
  "meta": { "title": "Mi deck" },
  "slides": [
    { "id": "cover", "layout": "hero-cover", "title": "Hola" },
    { "id": "body", "layout": "two-column-text", "title": "Sección", "body": "..." }
  ]
}
```

Pasa esto por `normalize_deck_spec` y obtendrás un deck válido con brand magmalabs y theme magma por defecto.
