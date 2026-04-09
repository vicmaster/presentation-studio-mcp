import { z } from 'zod';
import { auditDeck, buildPreviewManifest } from '@presentation-studio/core';
import type { ToolHandler } from '../toolRegistry.js';

const InputSchema = z.object({});

export const previewDeckTool: ToolHandler<z.infer<typeof InputSchema>> = {
  name: 'preview_deck',
  description:
    'Build a rich preview manifest for the current deck. Includes per-slide density, word counts, asset paths, summary excerpts and any audit issues.',
  inputSchema: InputSchema,
  jsonSchema: { type: 'object', properties: {} },
  handler: async (service) => {
    const deck = service.requireCurrentDeck();
    const audit = auditDeck(deck, {
      knownLayouts: service.knownLayouts(),
      baseDir: service.repoRoot,
    });
    const manifest = buildPreviewManifest({
      deck,
      audit,
      deckPptxPath: service.getCurrentDeckPath(),
    });
    return { manifest };
  },
};
