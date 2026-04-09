import { z } from 'zod';

/**
 * Brief - a structured description of what the user wants to present.
 *
 * The Brief is the human/agent-facing input. It is the starting point for
 * `plan_deck` which converts it into a `DeckSpec`.
 */
export const PresentationTypeSchema = z.enum([
  'brochure',
  'case-study',
  'sales-proposal',
  'quarterly-review',
  'exec-update',
  'training',
  'internal-update',
  'product-overview',
  'generic',
]);
export type PresentationType = z.infer<typeof PresentationTypeSchema>;

export const ToneSchema = z.enum([
  'professional',
  'premium',
  'friendly',
  'authoritative',
  'playful',
  'technical',
  'inspirational',
]);
export type Tone = z.infer<typeof ToneSchema>;

export const BriefSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  intent: z.string().optional(),
  hints: z.array(z.string()).default([]),
});
export type BriefSection = z.infer<typeof BriefSectionSchema>;

export const BriefSourceAssetSchema = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
  kind: z.enum(['image', 'logo', 'icon', 'screenshot', 'texture', 'other']).default('image'),
  role: z.string().optional(),
  alt: z.string().optional(),
});
export type BriefSourceAsset = z.infer<typeof BriefSourceAssetSchema>;

export const BriefConstraintsSchema = z
  .object({
    must_include: z.array(z.string()).default([]),
    avoid: z.array(z.string()).default([]),
    max_text_per_slide: z.number().int().positive().optional(),
    require_closing_cta: z.boolean().default(true),
  })
  .default({});
export type BriefConstraints = z.infer<typeof BriefConstraintsSchema>;

export const BriefSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  goal: z.string().min(1),
  audience: z.string().min(1),
  language: z.string().default('es'),
  tone: ToneSchema.default('professional'),
  brand_id: z.string().min(1),
  presentation_type: PresentationTypeSchema.default('generic'),
  max_slides: z.number().int().positive().max(80).default(12),
  key_messages: z.array(z.string()).default([]),
  sections: z.array(BriefSectionSchema).default([]),
  source_assets: z.array(BriefSourceAssetSchema).default([]),
  constraints: BriefConstraintsSchema,
  notes: z.string().optional(),
});
export type Brief = z.infer<typeof BriefSchema>;

/** Input accepted by `create_brief` tool. `id` is generated server-side if missing. */
export const BriefInputSchema = BriefSchema.partial({
  id: true,
  language: true,
  tone: true,
  presentation_type: true,
  max_slides: true,
  key_messages: true,
  sections: true,
  source_assets: true,
  constraints: true,
}).extend({
  title: z.string().min(1),
  goal: z.string().min(1),
  audience: z.string().min(1),
  brand_id: z.string().min(1),
});
export type BriefInput = z.infer<typeof BriefInputSchema>;
