import { z } from 'zod';
import { BriefInputSchema, BriefSchema, type Brief } from '@presentation-studio/schema';
import { generateDeckId } from '@presentation-studio/core';
import type { ToolHandler } from '../toolRegistry.js';

const inputJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    goal: { type: 'string' },
    audience: { type: 'string' },
    language: { type: 'string' },
    tone: { type: 'string' },
    brand_id: { type: 'string' },
    presentation_type: { type: 'string' },
    max_slides: { type: 'number' },
    key_messages: { type: 'array', items: { type: 'string' } },
    sections: { type: 'array' },
    source_assets: { type: 'array' },
    constraints: { type: 'object' },
    notes: { type: 'string' },
  },
  required: ['title', 'goal', 'audience', 'brand_id'],
  additionalProperties: true,
};

export const createBriefTool: ToolHandler<z.infer<typeof BriefInputSchema>> = {
  name: 'create_brief',
  description:
    'Validate and normalize a Brief. Generates an id if missing and applies defaults. Returns a strict Brief object.',
  inputSchema: BriefInputSchema,
  jsonSchema: inputJsonSchema,
  handler: async (_service, input) => {
    const brief: Brief = BriefSchema.parse({
      id: input.id ?? generateDeckId(),
      title: input.title,
      goal: input.goal,
      audience: input.audience,
      language: input.language ?? 'es',
      tone: input.tone ?? 'professional',
      brand_id: input.brand_id,
      presentation_type: input.presentation_type ?? 'generic',
      max_slides: input.max_slides ?? 12,
      key_messages: input.key_messages ?? [],
      sections: input.sections ?? [],
      source_assets: input.source_assets ?? [],
      constraints: input.constraints ?? {},
      notes: input.notes,
    });
    return { brief };
  },
};
