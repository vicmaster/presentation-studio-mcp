import { auditDeck } from '@presentation-studio/core';
import type { ResourceHandler } from '../resourceRegistry.js';

export const currentAuditResource: ResourceHandler = {
  uri: 'deck://current/audit',
  name: 'Current deck audit report',
  description: 'Audit report for the current session DeckSpec.',
  mimeType: 'application/json',
  read: async (service) => {
    const deck = service.getCurrentDeck();
    if (!deck) return JSON.stringify({ message: 'No deck loaded.' }, null, 2);
    const report = auditDeck(deck, {
      knownLayouts: service.knownLayouts(),
      baseDir: service.repoRoot,
    });
    return JSON.stringify(report, null, 2);
  },
};
