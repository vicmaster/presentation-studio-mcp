import { z } from 'zod';
import { BriefSchema } from '@presentation-studio/schema';
import { buildDeckSpecFromBrief } from '@presentation-studio/core';
import type { ToolHandler } from '../toolRegistry.js';

const InputSchema = z.object({
  brief: BriefSchema,
  template_id: z.string().optional(),
});

export const planDeckTool: ToolHandler<z.infer<typeof InputSchema>> = {
  name: 'plan_deck',
  description:
    'Turn a Brief into a DeckSpec skeleton using a template. Fills slides with layouts, seeds titles and notes but leaves content for you to refine.',
  inputSchema: InputSchema,
  jsonSchema: {
    type: 'object',
    properties: {
      brief: { type: 'object' },
      template_id: { type: 'string' },
    },
    required: ['brief'],
  },
  handler: async (service, input) => {
    const template = input.template_id
      ? service.templateRegistry.get(input.template_id)
      : undefined;
    const deck = buildDeckSpecFromBrief({
      brief: input.brief,
      brandRegistry: service.brandRegistry,
      templateRegistry: service.templateRegistry,
      template,
    });
    service.setCurrentDeck(deck);
    return {
      deck,
      outline: deck.slides.map((s, i) => ({
        index: i,
        slide_id: s.id,
        layout: s.layout,
        title: s.title,
        purpose: s.notes,
      })),
    };
  },
};
