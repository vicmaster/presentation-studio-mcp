import { z } from 'zod';
import { AssetRefSchema, type AssetRef } from './asset.js';

/**
 * SlideSpec - describes the content of a single slide.
 *
 * The renderer decides how to place and style this content using a
 * LayoutRenderer identified by `layout`.
 */
export const SlideBackgroundSchema = z.object({
  color: z.string().optional(),
  image: AssetRefSchema.optional(),
  style: z.enum(['light', 'dark', 'accent', 'image']).optional(),
});
export type SlideBackground = z.infer<typeof SlideBackgroundSchema>;

export const SlideMetricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  detail: z.string().optional(),
  color: z.string().optional(),
});
export type SlideMetric = z.infer<typeof SlideMetricSchema>;

export const SlideItemSchema = z.object({
  label: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: AssetRefSchema.optional(),
  highlight: z.boolean().default(false),
});
export type SlideItem = z.infer<typeof SlideItemSchema>;

export const SlideCtaSchema = z.object({
  label: z.string().min(1),
  url: z.string().optional(),
  email: z.string().optional(),
  contact: z.string().optional(),
});
export type SlideCta = z.infer<typeof SlideCtaSchema>;

export const SlideStyleOverridesSchema = z
  .object({
    title_color: z.string().optional(),
    subtitle_color: z.string().optional(),
    background_color: z.string().optional(),
    text_color: z.string().optional(),
    accent_color: z.string().optional(),
  })
  .partial();
export type SlideStyleOverrides = z.infer<typeof SlideStyleOverridesSchema>;

export const SlideLayoutOptionsSchema = z
  .object({
    image_position: z.enum(['left', 'right', 'top', 'bottom', 'background']).optional(),
    columns: z.number().int().min(1).max(6).optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
    padding: z.enum(['tight', 'normal', 'loose']).optional(),
    density: z.enum(['minimal', 'balanced', 'dense']).optional(),
  })
  .partial();
export type SlideLayoutOptions = z.infer<typeof SlideLayoutOptionsSchema>;

export const SlideSpecSchema = z.object({
  id: z.string().min(1),
  layout: z.string().min(1),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  kicker: z.string().optional(),
  body: z.string().optional(),
  bullets: z.array(z.string()).default([]),
  items: z.array(SlideItemSchema).default([]),
  metrics: z.array(SlideMetricSchema).default([]),
  quote: z.string().optional(),
  quote_author: z.string().optional(),
  images: z.array(AssetRefSchema).default([]),
  logos: z.array(AssetRefSchema).default([]),
  background: SlideBackgroundSchema.optional(),
  cta: SlideCtaSchema.optional(),
  notes: z.string().optional(),
  style_overrides: SlideStyleOverridesSchema.default({}),
  layout_options: SlideLayoutOptionsSchema.default({}),
  hidden: z.boolean().default(false),
});
export type SlideSpec = z.infer<typeof SlideSpecSchema>;

/** Partial slide spec accepted by `update_slide`. Only `id` is required. */
export const SlideSpecUpdateSchema = SlideSpecSchema.partial().extend({
  id: z.string().min(1),
});
export type SlideSpecUpdate = z.infer<typeof SlideSpecUpdateSchema>;

/** Helper: extract all asset references from a slide. */
export function collectSlideAssets(slide: SlideSpec): AssetRef[] {
  const out: AssetRef[] = [];
  out.push(...slide.images);
  out.push(...slide.logos);
  if (slide.background?.image) out.push(slide.background.image);
  for (const item of slide.items) {
    if (item.image) out.push(item.image);
  }
  return out;
}
