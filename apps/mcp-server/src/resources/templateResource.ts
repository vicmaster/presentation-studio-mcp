import type { DynamicResourceProvider, ResourceHandler } from '../resourceRegistry.js';

/**
 * Provides a resource per registered template. URI scheme: `template://<id>`.
 * This replaces the previously hardcoded MagmaLabs-oriented URIs and makes
 * the MCP surface reflect whatever templates the fork has loaded (built-in,
 * JSON-loaded from disk, or both).
 */
export const templateResourceProvider: DynamicResourceProvider = (service) => {
  const resources: ResourceHandler[] = [];
  for (const template of service.templateRegistry.list()) {
    resources.push({
      uri: `template://${template.id}`,
      name: `Template: ${template.name}`,
      description: template.description,
      mimeType: 'application/json',
      read: async (svc) => {
        const found = svc.templateRegistry.get(template.id);
        if (!found) throw new Error(`Template not registered: ${template.id}`);
        return JSON.stringify(found, null, 2);
      },
    });
  }
  return resources;
};
