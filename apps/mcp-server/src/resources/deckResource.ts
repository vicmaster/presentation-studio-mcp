import type { ResourceHandler } from '../resourceRegistry.js';

export const currentDeckResource: ResourceHandler = {
  uri: 'deck://current/spec',
  name: 'Current DeckSpec',
  description: 'The in-memory DeckSpec maintained by the MCP session.',
  mimeType: 'application/json',
  read: async (service) => {
    const deck = service.getCurrentDeck();
    if (!deck) {
      return JSON.stringify({ message: 'No deck loaded.' }, null, 2);
    }
    return JSON.stringify(deck, null, 2);
  },
};
