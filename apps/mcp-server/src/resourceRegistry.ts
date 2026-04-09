import type { PresentationStudioService } from './server.js';

export interface ResourceHandler {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  read: (service: PresentationStudioService) => Promise<string>;
}

/**
 * Dynamic resource providers are functions that generate a list of resources
 * based on the current state of the service (brands registered, templates
 * loaded, current deck, etc.). This lets the MCP surface change as the fork
 * adds its own brands/templates without us having to hardcode URIs.
 */
export type DynamicResourceProvider = (
  service: PresentationStudioService,
) => ResourceHandler[];

export class ResourceRegistry {
  private readonly staticResources: Map<string, ResourceHandler> = new Map();
  private readonly dynamicProviders: DynamicResourceProvider[] = [];

  registerStatic(resource: ResourceHandler): void {
    this.staticResources.set(resource.uri, resource);
  }

  registerDynamic(provider: DynamicResourceProvider): void {
    this.dynamicProviders.push(provider);
  }

  private resolveAll(service: PresentationStudioService): Map<string, ResourceHandler> {
    const out = new Map<string, ResourceHandler>(this.staticResources);
    for (const provider of this.dynamicProviders) {
      for (const r of provider(service)) out.set(r.uri, r);
    }
    return out;
  }

  list(
    service: PresentationStudioService,
  ): Array<{ uri: string; name: string; description: string; mimeType: string }> {
    return Array.from(this.resolveAll(service).values()).map((r) => ({
      uri: r.uri,
      name: r.name,
      description: r.description,
      mimeType: r.mimeType,
    }));
  }

  async read(
    service: PresentationStudioService,
    uri: string,
  ): Promise<{ uri: string; mimeType: string; text: string }> {
    const resource = this.resolveAll(service).get(uri);
    if (!resource) {
      throw new Error(`Unknown resource: ${uri}`);
    }
    const text = await resource.read(service);
    return { uri, mimeType: resource.mimeType, text };
  }
}
