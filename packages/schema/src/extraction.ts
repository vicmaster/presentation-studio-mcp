import { z } from 'zod';

/**
 * Extraction types - result of parsing an existing `.pptx` file.
 */
export const ExtractedMediaSchema = z.object({
  path: z.string().min(1),
  filename: z.string().min(1),
  content_type: z.string().optional(),
  size_bytes: z.number().int().nonnegative(),
  extracted_to: z.string().optional(),
});
export type ExtractedMedia = z.infer<typeof ExtractedMediaSchema>;

export const ExtractedSlideSchema = z.object({
  index: z.number().int().nonnegative(),
  slide_file: z.string().min(1),
  title: z.string().optional(),
  text_blocks: z.array(z.string()).default([]),
  notes: z.string().optional(),
  media_refs: z.array(z.string()).default([]),
});
export type ExtractedSlide = z.infer<typeof ExtractedSlideSchema>;

export const ExtractionMetadataSchema = z
  .object({
    title: z.string().optional(),
    creator: z.string().optional(),
    last_modified_by: z.string().optional(),
    created: z.string().optional(),
    modified: z.string().optional(),
    revision: z.string().optional(),
    application: z.string().optional(),
  })
  .partial();
export type ExtractionMetadata = z.infer<typeof ExtractionMetadataSchema>;

export const ExtractionResultSchema = z.object({
  pptx_path: z.string().min(1),
  slide_count: z.number().int().nonnegative(),
  slides: z.array(ExtractedSlideSchema),
  media: z.array(ExtractedMediaSchema),
  metadata: ExtractionMetadataSchema.default({}),
  warnings: z.array(z.string()).default([]),
  extracted_at: z.string(),
});
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
