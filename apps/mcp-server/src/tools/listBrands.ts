import { z } from 'zod';
import type { ToolHandler } from '../toolRegistry.js';

const InputSchema = z.object({});

export const listBrandsTool: ToolHandler<z.infer<typeof InputSchema>> = {
  name: 'list_brands',
  description: 'Return the list of registered brand kits.',
  inputSchema: InputSchema,
  jsonSchema: { type: 'object', properties: {} },
  handler: async (service) => {
    const brands = service.brandRegistry.list();
    return {
      brands: brands.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        colors: b.colors,
        fonts: b.fonts,
        default_theme: b.default_theme,
        preferred_layouts: b.preferred_layouts,
      })),
    };
  },
};
