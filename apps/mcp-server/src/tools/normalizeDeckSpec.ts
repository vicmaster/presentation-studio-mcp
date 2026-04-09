import { z } from 'zod';
import { normalizeDeckSpec } from '@presentation-studio/core';
import type { ToolHandler } from '../toolRegistry.js';

const InputSchema = z.object({
  deck: z.record(z.unknown()),
  default_brand_id: z.string().optional(),
  set_as_current: z.boolean().default(true),
});

export const normalizeDeckSpecTool: ToolHandler<z.infer<typeof InputSchema>> = {
  name: 'normalize_deck_spec',
  description:
    'Take a partial deck payload and produce a strict, validated DeckSpec. Fills defaults, resolves the brand and makes sure slide ids are unique.',
  inputSchema: InputSchema,
  jsonSchema: {
    type: 'object',
    properties: {
      deck: { type: 'object' },
      default_brand_id: { type: 'string' },
      set_as_current: { type: 'boolean' },
    },
    required: ['deck'],
  },
  handler: async (service, input) => {
    const { deck, warnings } = normalizeDeckSpec(input.deck, {
      brandRegistry: service.brandRegistry,
      defaultBrandId: input.default_brand_id ?? 'magmalabs',
    });
    if (input.set_as_current !== false) {
      service.setCurrentDeck(deck);
    }
    return { deck, warnings };
  },
};
