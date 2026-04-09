import { z } from 'zod';
import { dirname, resolve } from 'node:path';
import { DeckSpecSchema } from '@presentation-studio/schema';
import { renderDeck } from '@presentation-studio/renderer';
import type { ToolHandler } from '../toolRegistry.js';

const InputSchema = z.object({
  deck: DeckSpecSchema.optional(),
  output_path: z.string().min(1),
  base_dir: z.string().optional(),
});

export const renderDeckTool: ToolHandler<z.infer<typeof InputSchema>> = {
  name: 'render_deck',
  description:
    'Render a DeckSpec to .pptx on disk. If `deck` is omitted, the current session deck is used. Returns the output path and per-slide warnings.',
  inputSchema: InputSchema,
  jsonSchema: {
    type: 'object',
    properties: {
      deck: { type: 'object' },
      output_path: { type: 'string' },
      base_dir: { type: 'string' },
    },
    required: ['output_path'],
  },
  handler: async (service, input) => {
    const deck = input.deck ?? service.requireCurrentDeck();
    const outputPath = resolve(service.repoRoot, input.output_path);
    const baseDir = input.base_dir
      ? resolve(service.repoRoot, input.base_dir)
      : dirname(outputPath);
    const result = await renderDeck({
      deck,
      outputPath,
      layoutRegistry: service.layoutRegistry,
      themeRegistry: service.themeRegistry,
      baseDir,
    });
    service.setCurrentDeck(deck, result.output_path);
    return {
      output_path: result.output_path,
      slide_count: result.slide_count,
      warnings: result.warnings,
    };
  },
};
