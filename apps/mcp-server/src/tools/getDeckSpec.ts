import { z } from 'zod';
import type { ToolHandler } from '../toolRegistry.js';

const InputSchema = z.object({});

export const getDeckSpecTool: ToolHandler<z.infer<typeof InputSchema>> = {
  name: 'get_deck_spec',
  description: 'Return the current session DeckSpec (the deck held in memory since the last plan/normalize/save/update).',
  inputSchema: InputSchema,
  jsonSchema: { type: 'object', properties: {} },
  handler: async (service) => {
    const deck = service.requireCurrentDeck();
    return { deck, deck_path: service.getCurrentDeckPath() };
  },
};
