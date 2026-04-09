import { z } from 'zod';

/**
 * PreviewManifest - a lightweight "visual proxy" of the deck.
 *
 * We do not ship a headless PowerPoint renderer; instead we produce a
 * rich manifest that captures layout, density, text and asset paths so that
 * agents can review the deck without opening PowerPoint.
 */
export const PreviewSlideSchema = z.object({
  index: z.number().int().nonnegative(),
  slide_id: z.string().min(1),
  layout: z.string().min(1),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  kicker: z.string().optional(),
  summary: z.string().default(''),
  word_count: z.number().int().nonnegative(),
  bullet_count: z.number().int().nonnegative(),
  item_count: z.number().int().nonnegative(),
  metric_count: z.number().int().nonnegative(),
  image_count: z.number().int().nonnegative(),
  logo_count: z.number().int().nonnegative(),
  asset_paths: z.array(z.string()).default([]),
  density_score: z.number().min(0).max(1),
  density_label: z.enum(['minimal', 'balanced', 'dense', 'overloaded']),
  audit_issues: z
    .array(
      z.object({
        severity: z.string(),
        code: z.string(),
        message: z.string(),
      }),
    )
    .default([]),
});
export type PreviewSlide = z.infer<typeof PreviewSlideSchema>;

export const PreviewManifestSchema = z.object({
  deck_title: z.string().min(1),
  deck_language: z.string().default('es'),
  slide_count: z.number().int().nonnegative(),
  slides: z.array(PreviewSlideSchema),
  preview_paths: z.array(z.string()).default([]),
  deck_pptx_path: z.string().optional(),
  generated_at: z.string(),
});
export type PreviewManifest = z.infer<typeof PreviewManifestSchema>;
