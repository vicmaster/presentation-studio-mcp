import { z } from 'zod';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DeckSpecSchema } from '@presentation-studio/schema';
import type { ToolHandler } from '../toolRegistry.js';

const InputSchema = z.object({
  output_path: z.string().min(1),
  deck: DeckSpecSchema.optional(),
});

export const saveDeckSpecTool: ToolHandler<z.infer<typeof InputSchema>> = {
  name: 'save_deck_spec',
  description:
    'Persist the current DeckSpec (or a provided one) to disk as JSON. Also updates the session to point at the saved path.',
  inputSchema: InputSchema,
  jsonSchema: {
    type: 'object',
    properties: {
      output_path: { type: 'string' },
      deck: { type: 'object' },
    },
    required: ['output_path'],
  },
  handler: async (service, input) => {
    const deck = input.deck ?? service.requireCurrentDeck();
    const absolute = resolve(service.repoRoot, input.output_path);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, JSON.stringify(deck, null, 2), 'utf-8');
    service.setCurrentDeck(deck, absolute);
    return { deck_path: absolute, slide_count: deck.slides.length };
  },
};
