import { resolve } from 'node:path';
import {
  BrandRegistry,
  TemplateRegistry,
  createDefaultBrandRegistry,
  createDefaultTemplateRegistry,
  PillowBridge,
  loadStudioConfig,
  type StudioConfig,
} from '@presentation-studio/core';
import type { DeckSpec } from '@presentation-studio/schema';
import {
  LayoutRegistry,
  ThemeRegistry,
  createDefaultLayoutRegistry,
  createDefaultThemeRegistry,
} from '@presentation-studio/renderer';

/**
 * PresentationStudioService wires together all registries, the Pillow bridge
 * and the in-memory session deck. It honors `presentation-studio.config.json`
 * (if present) so forks can customize which brands and templates ship.
 */
export interface PresentationStudioConfig {
  repoRoot: string;
  /** Path to a presentation-studio.config.json to load. Defaults to repoRoot/presentation-studio.config.json. */
  configPath?: string;
  pythonExecutable?: string;
}

export class PresentationStudioService {
  public readonly repoRoot: string;
  public readonly studioConfig: StudioConfig;
  public readonly studioConfigSource: 'file' | 'defaults';
  public readonly brandRegistry: BrandRegistry;
  public readonly templateRegistry: TemplateRegistry;
  public readonly layoutRegistry: LayoutRegistry;
  public readonly themeRegistry: ThemeRegistry;
  public readonly pillow: PillowBridge;

  private currentDeck?: DeckSpec;
  private currentDeckPath?: string;

  constructor(config: PresentationStudioConfig) {
    this.repoRoot = config.repoRoot;
    const loaded = loadStudioConfig({
      repoRoot: config.repoRoot,
      configPath: config.configPath,
    });
    this.studioConfig = loaded.config;
    this.studioConfigSource = loaded.source;

    this.brandRegistry = createDefaultBrandRegistry({
      includeBuiltinBrand: this.studioConfig.load_builtin_brand,
    });
    this.templateRegistry = createDefaultTemplateRegistry({
      includeBuiltinTemplates: this.studioConfig.load_builtin_templates,
    });
    this.layoutRegistry = createDefaultLayoutRegistry();
    this.themeRegistry = createDefaultThemeRegistry();

    // Load brands from disk. This ALWAYS runs so users can add brands next
    // to the built-in ones or replace them entirely when the built-in is off.
    const brandsDir = resolve(config.repoRoot, this.studioConfig.brands_dir);
    this.brandRegistry.loadFromDirectory(brandsDir);

    // Load user-defined JSON templates if a directory is configured.
    if (this.studioConfig.templates_dir) {
      const templatesDir = resolve(config.repoRoot, this.studioConfig.templates_dir);
      this.templateRegistry.loadFromDirectory(templatesDir);
    }

    this.pillow = new PillowBridge({
      repoRoot: config.repoRoot,
      pythonExecutable: config.pythonExecutable,
    });
  }

  getCurrentDeck(): DeckSpec | undefined {
    return this.currentDeck;
  }

  getCurrentDeckPath(): string | undefined {
    return this.currentDeckPath;
  }

  setCurrentDeck(deck: DeckSpec, path?: string): void {
    this.currentDeck = deck;
    this.currentDeckPath = path;
  }

  requireCurrentDeck(): DeckSpec {
    if (!this.currentDeck) {
      throw new Error(
        'No deck is loaded. Call normalize_deck_spec, save_deck_spec or plan_deck first.',
      );
    }
    return this.currentDeck;
  }

  knownLayouts(): Set<string> {
    return new Set(this.layoutRegistry.list());
  }

  /** Default brand id to use when a deck does not specify one. */
  defaultBrandId(): string {
    return this.studioConfig.default_brand_id;
  }
}
