import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ALL_TEMPLATES } from '@presentation-studio/templates';
import { DeckTemplateSchema, type DeckTemplate } from '@presentation-studio/schema';

/**
 * Registry layer around DeckTemplates.
 *
 * Templates can come from two places:
 *   1. The built-in `@presentation-studio/templates` package (7 templates).
 *   2. `*.json` files dropped into a "templates" directory on disk.
 *
 * This makes the tool usable as open source: anyone can define their own
 * templates via JSON without forking the repo.
 */
export class TemplateRegistry {
  private readonly templates: Map<string, DeckTemplate> = new Map();

  register(template: DeckTemplate): void {
    this.templates.set(template.id, template);
  }

  get(id: string): DeckTemplate | undefined {
    return this.templates.get(id);
  }

  has(id: string): boolean {
    return this.templates.has(id);
  }

  list(): DeckTemplate[] {
    return Array.from(this.templates.values());
  }

  findForPresentationType(type: string): DeckTemplate | undefined {
    // Default mapping from brief.presentation_type to a built-in template id.
    // If the requested default is not registered (because builtin templates
    // were disabled), we fall back to the first template in the registry so
    // the tool still works for installs that only load custom templates.
    const mapping: Record<string, string> = {
      brochure: 'brochure-enterprise',
      'case-study': 'case-study-modern',
      'sales-proposal': 'sales-proposal',
      'quarterly-review': 'quarterly-review',
      'exec-update': 'exec-update',
      training: 'training-deck',
      'internal-update': 'exec-update',
      'product-overview': 'brochure-premium',
      generic: 'brochure-enterprise',
    };
    const templateId = mapping[type];
    if (templateId && this.templates.has(templateId)) {
      return this.templates.get(templateId);
    }
    const first = this.templates.values().next();
    return first.value;
  }

  /**
   * Loads every `*.json` file from `dir` as a DeckTemplate. Files are parsed
   * through `DeckTemplateSchema` so defaults are applied. Templates that fail
   * to parse are reported but do not abort the load.
   */
  loadFromDirectory(dir: string): {
    loaded: string[];
    errors: Array<{ path: string; error: string }>;
  } {
    const loaded: string[] = [];
    const errors: Array<{ path: string; error: string }> = [];
    const absolute = resolve(dir);
    if (!existsSync(absolute) || !statSync(absolute).isDirectory()) {
      return { loaded, errors };
    }

    for (const entry of readdirSync(absolute)) {
      if (!entry.endsWith('.json')) continue;
      const filePath = join(absolute, entry);
      try {
        const raw = JSON.parse(readFileSync(filePath, 'utf-8')) as unknown;
        const template = DeckTemplateSchema.parse(raw);
        this.templates.set(template.id, template);
        loaded.push(template.id);
      } catch (err) {
        errors.push({
          path: filePath,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return { loaded, errors };
  }
}

export interface CreateTemplateRegistryOptions {
  /** If false, the seven built-in templates are NOT pre-registered. */
  includeBuiltinTemplates?: boolean;
}

export function createDefaultTemplateRegistry(
  opts: CreateTemplateRegistryOptions = {},
): TemplateRegistry {
  const registry = new TemplateRegistry();
  if (opts.includeBuiltinTemplates !== false) {
    for (const template of ALL_TEMPLATES) registry.register(template);
  }
  return registry;
}
