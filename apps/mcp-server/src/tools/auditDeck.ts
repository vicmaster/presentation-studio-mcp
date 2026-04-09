import { z } from 'zod';
import { auditDeck } from '@presentation-studio/core';
import type { ToolHandler } from '../toolRegistry.js';

const InputSchema = z.object({
  base_dir: z.string().optional(),
});

export const auditDeckTool: ToolHandler<z.infer<typeof InputSchema>> = {
  name: 'audit_deck',
  description: 'Run the audit rules against the current deck and return the report.',
  inputSchema: InputSchema,
  jsonSchema: { type: 'object', properties: { base_dir: { type: 'string' } } },
  handler: async (service, input) => {
    const deck = service.requireCurrentDeck();
    const report = auditDeck(deck, {
      knownLayouts: service.knownLayouts(),
      baseDir: input.base_dir ?? service.repoRoot,
    });
    return { report };
  },
};
