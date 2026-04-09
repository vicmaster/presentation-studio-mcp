import { z } from 'zod';
import { prepareAssets } from '@presentation-studio/core';
import { AssetOperationSchema } from '@presentation-studio/schema';
import type { ToolHandler } from '../toolRegistry.js';

const InputSchema = z.object({
  plan: z.object({
    id: z.string().optional(),
    base_dir: z.string().optional(),
    operations: z.array(AssetOperationSchema),
    defaults: z
      .object({
        role: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

export const prepareAssetsTool: ToolHandler<z.infer<typeof InputSchema>> = {
  name: 'prepare_assets',
  description:
    'Execute a Pillow-based asset preparation plan. Runs each operation in the Python worker and returns a manifest with processed assets.',
  inputSchema: InputSchema,
  jsonSchema: {
    type: 'object',
    properties: {
      plan: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          base_dir: { type: 'string' },
          operations: { type: 'array' },
          defaults: { type: 'object' },
        },
        required: ['operations'],
      },
    },
    required: ['plan'],
  },
  handler: async (service, input) => {
    const result = await prepareAssets({
      plan: input.plan as any,
      pillow: service.pillow,
      repoRoot: service.repoRoot,
    });
    return {
      manifest: result.manifest,
      operation_results: result.operation_results,
      warnings: result.warnings,
    };
  },
};
