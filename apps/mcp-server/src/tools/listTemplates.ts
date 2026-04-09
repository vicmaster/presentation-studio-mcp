import { z } from 'zod';
import type { ToolHandler } from '../toolRegistry.js';

const InputSchema = z.object({});

export const listTemplatesTool: ToolHandler<z.infer<typeof InputSchema>> = {
  name: 'list_templates',
  description: 'Return all registered deck templates with their metadata and recommended flow.',
  inputSchema: InputSchema,
  jsonSchema: { type: 'object', properties: {} },
  handler: async (service) => {
    const templates = service.templateRegistry.list();
    return {
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        recommended_audience: t.recommended_audience,
        recommended_slide_count: t.recommended_slide_count,
        density_guidance: t.density_guidance,
        default_theme: t.default_theme,
        slide_flow: t.slide_flow,
      })),
    };
  },
};
