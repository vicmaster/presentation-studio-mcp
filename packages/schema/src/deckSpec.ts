import { z } from 'zod';
import { DeckBrandRefSchema } from './brand.js';
import { AssetRefSchema } from './asset.js';
import { SlideSpecSchema } from './slide.js';

/**
 * DeckSpec is the single source of truth for a presentation.
 *
 * The agent builds (or edits) a DeckSpec and the renderer turns it into .pptx.
 */
export const DeckMetaSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  language: z.string().default('es'),
  presentation_type: z.string().default('generic'),
  author: z.string().default('presentation-studio-mcp'),
  version: z.string().default('1.0.0'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
export type DeckMeta = z.infer<typeof DeckMetaSchema>;

export const DeckThemeSchema = z.object({
  id: z.string().default('magma'),
  page_size: z.enum(['LAYOUT_WIDE', 'LAYOUT_STANDARD', 'LAYOUT_16x10']).default('LAYOUT_WIDE'),
  density: z.enum(['minimal', 'balanced', 'dense']).default('balanced'),
  background_style: z.enum(['light', 'dark', 'accent']).default('light'),
  show_footer: z.boolean().default(true),
  show_page_numbers: z.boolean().default(true),
  footer_text: z.string().optional(),
});
export type DeckTheme = z.infer<typeof DeckThemeSchema>;

export const DeckSpecSchema = z.object({
  meta: DeckMetaSchema,
  brand: DeckBrandRefSchema,
  theme: DeckThemeSchema,
  assets: z.array(AssetRefSchema).default([]),
  slides: z.array(SlideSpecSchema).min(1, 'A deck must contain at least one slide'),
});
export type DeckSpec = z.infer<typeof DeckSpecSchema>;

/** Partial deck accepted as input to `normalize_deck_spec`. */
export const DeckSpecInputSchema = DeckSpecSchema.deepPartial().extend({
  meta: DeckMetaSchema.partial().extend({
    title: z.string().min(1),
  }),
  slides: z.array(SlideSpecSchema.partial().extend({ id: z.string().min(1), layout: z.string().min(1) })),
});
export type DeckSpecInput = z.infer<typeof DeckSpecInputSchema>;
