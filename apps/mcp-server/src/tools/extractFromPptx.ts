import { z } from 'zod';
import { resolve } from 'node:path';
import { extractFromPptx } from '@presentation-studio/core';
import type { ToolHandler } from '../toolRegistry.js';

const InputSchema = z.object({
  pptx_path: z.string().min(1),
  output_dir: z.string().min(1),
  extract_media: z.boolean().default(true),
});

export const extractFromPptxTool: ToolHandler<z.infer<typeof InputSchema>> = {
  name: 'extract_from_pptx',
  description:
    'Extract slide text, metadata and media from an existing .pptx file. Useful for reusing content from previous decks.',
  inputSchema: InputSchema,
  jsonSchema: {
    type: 'object',
    properties: {
      pptx_path: { type: 'string' },
      output_dir: { type: 'string' },
      extract_media: { type: 'boolean' },
    },
    required: ['pptx_path', 'output_dir'],
  },
  handler: async (service, input) => {
    const result = extractFromPptx({
      pptxPath: resolve(service.repoRoot, input.pptx_path),
      outputDir: resolve(service.repoRoot, input.output_dir),
      extractMedia: input.extract_media,
    });
    return { result };
  },
};
