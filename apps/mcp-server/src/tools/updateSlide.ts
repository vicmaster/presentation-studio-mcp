import { z } from 'zod';
import { SlideSpecUpdateSchema } from '@presentation-studio/schema';
import { updateSlideInDeck } from '@presentation-studio/core';
import type { ToolHandler } from '../toolRegistry.js';

const InputSchema = z.object({
  slide: SlideSpecUpdateSchema,
  mode: z.enum(['merge', 'replace']).default('merge'),
});

export const updateSlideTool: ToolHandler<z.infer<typeof InputSchema>> = {
  name: 'update_slide',
  description:
    'Update (or insert) a slide inside the current deck. mode=merge overlays the patch on the existing slide; mode=replace treats the patch as a full slide. If the slide id does not exist, it is appended.',
  inputSchema: InputSchema,
  jsonSchema: {
    type: 'object',
    properties: {
      slide: { type: 'object' },
      mode: { type: 'string', enum: ['merge', 'replace'] },
    },
    required: ['slide'],
  },
  handler: async (service, input) => {
    const deck = service.requireCurrentDeck();
    const result = updateSlideInDeck({ deck, update: input.slide, mode: input.mode });
    service.setCurrentDeck(result.deck);
    return { action: result.action, deck: result.deck };
  },
};
