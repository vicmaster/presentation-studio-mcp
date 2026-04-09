import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

/**
 * Studio-level configuration (`presentation-studio.config.json`).
 *
 * The goal of this file is to let anyone run the project against their OWN
 * brands, templates and examples **without forking** the source. Every field
 * is optional and has a sensible default, so the file itself is also
 * optional — out of the box the tool uses the built-in MagmaLabs brand and
 * the seven built-in templates purely as an example.
 *
 * Place `presentation-studio.config.json` in the repo root (or pass a path
 * explicitly to `loadStudioConfig`).
 */
export const StudioConfigSchema = z.object({
  /** Id of the brand to use as the fallback during normalization. */
  default_brand_id: z.string().default('magmalabs'),

  /** Directory scanned for `brand.json` files. Relative to the repo root. */
  brands_dir: z.string().default('assets/brands'),

  /** Directory scanned for `*.json` template files. If set, its contents are merged on top of the built-in templates. */
  templates_dir: z.string().optional(),

  /** Directory where `cli` commands look for example decks. Purely informational. */
  examples_dir: z.string().default('examples'),

  /**
   * If false, the built-in MagmaLabs brand is NOT registered. Useful when you
   * want a clean slate and only load your own `brand.json` files from disk.
   */
  load_builtin_brand: z.boolean().default(true),

  /**
   * If false, the seven built-in templates are NOT registered. Useful when
   * you want only your own templates (loaded via `templates_dir`).
   */
  load_builtin_templates: z.boolean().default(true),

  /** Organization / product name used in docs, CLI output and examples. */
  organization_name: z.string().default('presentation-studio-mcp'),
});
export type StudioConfig = z.infer<typeof StudioConfigSchema>;

export const DEFAULT_STUDIO_CONFIG: StudioConfig = StudioConfigSchema.parse({});

export interface LoadStudioConfigOptions {
  repoRoot: string;
  /** Override path. If omitted, `presentation-studio.config.json` is used. */
  configPath?: string;
}

/**
 * Loads `presentation-studio.config.json` (or the overridden path) and
 * returns a strict StudioConfig. If the file does not exist, the defaults
 * are returned unchanged.
 */
export function loadStudioConfig(opts: LoadStudioConfigOptions): {
  config: StudioConfig;
  source: 'file' | 'defaults';
  path?: string;
} {
  const filename = opts.configPath ?? 'presentation-studio.config.json';
  const absolute = resolve(opts.repoRoot, filename);
  if (!existsSync(absolute)) {
    return { config: DEFAULT_STUDIO_CONFIG, source: 'defaults' };
  }
  const raw = JSON.parse(readFileSync(absolute, 'utf-8')) as unknown;
  const config = StudioConfigSchema.parse(raw);
  return { config, source: 'file', path: absolute };
}
