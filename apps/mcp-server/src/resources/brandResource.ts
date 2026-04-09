import type { DynamicResourceProvider, ResourceHandler } from '../resourceRegistry.js';

/**
 * Provides a resource for every brand currently registered.
 *
 * The URI scheme is `brand://<id>/default`. The first brand in the registry
 * is additionally exposed as `brand://default` so clients have a stable entry
 * point even when the default brand changes.
 */
export const brandResourceProvider: DynamicResourceProvider = (service) => {
  const resources: ResourceHandler[] = [];
  const brands = service.brandRegistry.list();
  for (const brand of brands) {
    resources.push({
      uri: `brand://${brand.id}/default`,
      name: `${brand.name} brand kit`,
      description: brand.description || `Brand kit for ${brand.name}.`,
      mimeType: 'application/json',
      read: async (svc) => {
        const found = svc.brandRegistry.get(brand.id);
        if (!found) throw new Error(`Brand not registered: ${brand.id}`);
        return JSON.stringify(found, null, 2);
      },
    });
  }
  // Stable alias for "whatever the current default brand is".
  const defaultId = service.defaultBrandId();
  if (service.brandRegistry.has(defaultId)) {
    resources.push({
      uri: 'brand://default',
      name: 'Default brand kit',
      description: `Alias for the currently configured default brand (${defaultId}).`,
      mimeType: 'application/json',
      read: async (svc) => {
        const found = svc.brandRegistry.get(svc.defaultBrandId());
        if (!found) throw new Error('Default brand not registered');
        return JSON.stringify(found, null, 2);
      },
    });
  }
  return resources;
};
