import { resolve } from 'node:path';
import {
  BrandRegistry,
  TemplateRegistry,
  createDefaultBrandRegistry,
  createDefaultTemplateRegistry,
  loadStudioConfig,
  type StudioConfig,
} from '@presentation-studio/core';
import { findRepoRoot } from './repo.js';

/**
 * Helper that builds brand + template registries from presentation-studio.config.json
 * so every CLI command honors the same configuration. Commands that need a
 * brand/template registry should call this instead of the default factories
 * directly.
 */
export interface StudioContext {
  repoRoot: string;
  config: StudioConfig;
  configSource: 'file' | 'defaults';
  brandRegistry: BrandRegistry;
  templateRegistry: TemplateRegistry;
}

export function loadStudioContext(): StudioContext {
  const repoRoot = findRepoRoot();
  const loaded = loadStudioConfig({ repoRoot });
  const brandRegistry = createDefaultBrandRegistry({
    includeBuiltinBrand: loaded.config.load_builtin_brand,
  });
  brandRegistry.loadFromDirectory(resolve(repoRoot, loaded.config.brands_dir));

  const templateRegistry = createDefaultTemplateRegistry({
    includeBuiltinTemplates: loaded.config.load_builtin_templates,
  });
  if (loaded.config.templates_dir) {
    templateRegistry.loadFromDirectory(resolve(repoRoot, loaded.config.templates_dir));
  }

  return {
    repoRoot,
    config: loaded.config,
    configSource: loaded.source,
    brandRegistry,
    templateRegistry,
  };
}
