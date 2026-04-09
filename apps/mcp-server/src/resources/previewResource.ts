import { auditDeck, buildPreviewManifest } from '@presentation-studio/core';
import type { ResourceHandler } from '../resourceRegistry.js';

export const currentPreviewResource: ResourceHandler = {
  uri: 'deck://current/previews',
  name: 'Current deck preview manifest',
  description: 'Rich preview manifest describing the current deck (density, words, layout, assets).',
  mimeType: 'application/json',
  read: async (service) => {
    const deck = service.getCurrentDeck();
    if (!deck) return JSON.stringify({ message: 'No deck loaded.' }, null, 2);
    const audit = auditDeck(deck, {
      knownLayouts: service.knownLayouts(),
      baseDir: service.repoRoot,
    });
    const manifest = buildPreviewManifest({
      deck,
      audit,
      deckPptxPath: service.getCurrentDeckPath(),
    });
    return JSON.stringify(manifest, null, 2);
  },
};
