import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  DEFAULT_STUDIO_CONFIG,
  StudioConfigSchema,
  createDefaultBrandRegistry,
  createDefaultTemplateRegistry,
  loadStudioConfig,
} from '@presentation-studio/core';
import { DeckTemplateSchema } from '@presentation-studio/schema';

describe('StudioConfig', () => {
  it('returns defaults when no config file exists', () => {
    const dir = mkdtempSync(join(tmpdir(), 'psmcp-cfg-'));
    const loaded = loadStudioConfig({ repoRoot: dir });
    expect(loaded.source).toBe('defaults');
    expect(loaded.config.default_brand_id).toBe('magmalabs');
    expect(loaded.config.load_builtin_brand).toBe(true);
    expect(loaded.config.load_builtin_templates).toBe(true);
  });

  it('respects a user config file on disk', () => {
    const dir = mkdtempSync(join(tmpdir(), 'psmcp-cfg-'));
    writeFileSync(
      join(dir, 'presentation-studio.config.json'),
      JSON.stringify({
        default_brand_id: 'acme',
        load_builtin_brand: false,
        load_builtin_templates: false,
        brands_dir: 'custom/brands',
      }),
    );
    const loaded = loadStudioConfig({ repoRoot: dir });
    expect(loaded.source).toBe('file');
    expect(loaded.config.default_brand_id).toBe('acme');
    expect(loaded.config.load_builtin_brand).toBe(false);
    expect(loaded.config.load_builtin_templates).toBe(false);
    expect(loaded.config.brands_dir).toBe('custom/brands');
  });

  it('parses strict config via schema', () => {
    const parsed = StudioConfigSchema.parse({});
    expect(parsed).toEqual(DEFAULT_STUDIO_CONFIG);
  });
});

describe('Registries honour include flags', () => {
  it('empty brand registry when includeBuiltinBrand is false', () => {
    const registry = createDefaultBrandRegistry({ includeBuiltinBrand: false });
    expect(registry.list()).toEqual([]);
    expect(registry.has('magmalabs')).toBe(false);
  });

  it('includes MagmaLabs by default', () => {
    const registry = createDefaultBrandRegistry();
    expect(registry.has('magmalabs')).toBe(true);
  });

  it('empty template registry when includeBuiltinTemplates is false', () => {
    const registry = createDefaultTemplateRegistry({ includeBuiltinTemplates: false });
    expect(registry.list()).toEqual([]);
  });

  it('loads JSON templates from a directory', () => {
    const dir = mkdtempSync(join(tmpdir(), 'psmcp-tpl-'));
    const tplDir = join(dir, 'templates');
    mkdirSync(tplDir, { recursive: true });
    const template = DeckTemplateSchema.parse({
      id: 'custom-one',
      name: 'Custom template',
      description: 'Loaded from JSON',
      recommended_audience: 'Anyone',
      recommended_slide_count: { min: 3, max: 5, ideal: 4 },
      density_guidance: 'balanced',
      default_theme: 'magma',
      slide_flow: [
        {
          slide_id: 'cover',
          layout: 'hero-cover',
          purpose: 'Title',
          required_fields: ['title'],
          optional_fields: [],
          content_hints: [],
          density: 'minimal',
        },
      ],
    });
    writeFileSync(join(tplDir, 'custom.json'), JSON.stringify(template));

    const registry = createDefaultTemplateRegistry({ includeBuiltinTemplates: false });
    const { loaded, errors } = registry.loadFromDirectory(tplDir);
    expect(errors).toEqual([]);
    expect(loaded).toContain('custom-one');
    expect(registry.has('custom-one')).toBe(true);
  });
});
