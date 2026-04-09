import { z } from 'zod';

/**
 * AssetRef - a reference to a file on disk used by a deck.
 *
 * Assets may be "source" (original, untouched) or "processed"
 * (resized/cropped/normalized via the Pillow worker).
 */
export const AssetKindSchema = z.enum([
  'image',
  'logo',
  'icon',
  'screenshot',
  'texture',
  'diagram',
  'other',
]);
export type AssetKind = z.infer<typeof AssetKindSchema>;

export const AssetRoleSchema = z.enum([
  'background',
  'hero',
  'thumbnail',
  'logo',
  'portrait',
  'screenshot',
  'cover-image',
  'texture',
  'diagram',
  'inline',
  'decorative',
  'other',
]);
export type AssetRole = z.infer<typeof AssetRoleSchema>;

export const AssetStatusSchema = z.enum(['source', 'processed', 'missing', 'corrupt']);
export type AssetStatus = z.infer<typeof AssetStatusSchema>;

export const AssetRefSchema = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
  kind: AssetKindSchema.default('image'),
  role: AssetRoleSchema.default('inline'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  alt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  source: z.string().optional(),
  status: AssetStatusSchema.default('source'),
  processed_from: z.string().optional(),
  processing: z
    .object({
      operation: z.string(),
      params: z.record(z.unknown()).optional(),
    })
    .optional(),
});
export type AssetRef = z.infer<typeof AssetRefSchema>;

/** An asset manifest is a normalized list of assets used by the deck. */
export const AssetManifestSchema = z.object({
  id: z.string().min(1),
  base_dir: z.string().min(1),
  assets: z.array(AssetRefSchema),
  generated_at: z.string(),
});
export type AssetManifest = z.infer<typeof AssetManifestSchema>;

export const AssetOperationSchema = z.object({
  operation: z.enum([
    'resize',
    'contain',
    'cover_crop',
    'normalize',
    'overlay',
    'montage',
    'thumbnail',
    'contact_sheet',
    'pad_to_canvas',
  ]),
  input_path: z.string().min(1),
  output_path: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  anchor: z.enum(['center', 'north', 'south', 'east', 'west', 'ne', 'nw', 'se', 'sw']).optional(),
  background: z.string().optional(),
  inputs: z.array(z.string()).optional(),
  columns: z.number().int().positive().optional(),
  overlay_path: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  format: z.enum(['png', 'jpg', 'jpeg', 'webp']).optional(),
  quality: z.number().int().min(1).max(100).optional(),
});
export type AssetOperation = z.infer<typeof AssetOperationSchema>;

export const AssetOperationResultSchema = z.object({
  ok: z.boolean(),
  operation: z.string(),
  output_path: z.string(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  warnings: z.array(z.string()).default([]),
  error: z.string().optional(),
});
export type AssetOperationResult = z.infer<typeof AssetOperationResultSchema>;
