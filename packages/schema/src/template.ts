import { z } from 'zod';

/**
 * Templates bundle a recommended slide flow, default layouts and
 * guidance for a specific kind of presentation (brochure, case study...).
 *
 * Templates are consumed by `plan_deck` to produce a useful outline.
 */
export const TemplateSlideBlueprintSchema = z.object({
  slide_id: z.string().min(1),
  layout: z.string().min(1),
  purpose: z.string().min(1),
  required_fields: z.array(z.string()).default([]),
  optional_fields: z.array(z.string()).default([]),
  content_hints: z.array(z.string()).default([]),
  density: z.enum(['minimal', 'balanced', 'dense']).default('balanced'),
});
export type TemplateSlideBlueprint = z.infer<typeof TemplateSlideBlueprintSchema>;

export const DeckTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  recommended_audience: z.string().min(1),
  recommended_slide_count: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
    ideal: z.number().int().positive(),
  }),
  density_guidance: z.enum(['minimal', 'balanced', 'dense']).default('balanced'),
  content_guidance: z.array(z.string()).default([]),
  slide_flow: z.array(TemplateSlideBlueprintSchema).min(1),
  default_theme: z.string().default('magma'),
});
export type DeckTemplate = z.infer<typeof DeckTemplateSchema>;
