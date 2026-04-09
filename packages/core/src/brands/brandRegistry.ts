import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { BrandKitSchema, type BrandKit, type DeckBrandRef } from '@presentation-studio/schema';

/**
 * The brand registry is the canonical source of brand definitions.
 *
 * Brands can be registered programmatically (for the built-in MagmaLabs brand)
 * or loaded from disk by scanning a directory containing `brand.json` files.
 */
export class BrandRegistry {
  private readonly brands: Map<string, BrandKit> = new Map();

  register(brand: BrandKit): void {
    const parsed = BrandKitSchema.parse(brand);
    this.brands.set(parsed.id, parsed);
  }

  get(id: string): BrandKit | undefined {
    return this.brands.get(id);
  }

  has(id: string): boolean {
    return this.brands.has(id);
  }

  list(): BrandKit[] {
    return Array.from(this.brands.values());
  }

  /**
   * Loads all `brand.json` files from a directory. Each brand must live in its
   * own subdirectory so relative asset paths are scoped.
   */
  loadFromDirectory(dir: string): { loaded: string[]; errors: Array<{ path: string; error: string }> } {
    const loaded: string[] = [];
    const errors: Array<{ path: string; error: string }> = [];
    const absolute = resolve(dir);
    if (!existsSync(absolute)) return { loaded, errors };

    for (const entry of readdirSync(absolute)) {
      const brandDir = join(absolute, entry);
      if (!statSync(brandDir).isDirectory()) continue;
      const brandFile = join(brandDir, 'brand.json');
      if (!existsSync(brandFile)) continue;
      try {
        const raw = JSON.parse(readFileSync(brandFile, 'utf-8')) as unknown;
        const parsed = BrandKitSchema.parse(raw);
        this.brands.set(parsed.id, this.resolveBrandPaths(parsed, brandDir));
        loaded.push(parsed.id);
      } catch (err) {
        errors.push({
          path: brandFile,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return { loaded, errors };
  }

  /**
   * Rewrites brand logo paths to be absolute based on the brand directory so
   * the renderer can resolve them without caring about CWD.
   */
  private resolveBrandPaths(brand: BrandKit, brandDir: string): BrandKit {
    const resolvePath = (p?: string): string | undefined => {
      if (!p) return undefined;
      if (p.startsWith('/')) return p;
      return resolve(brandDir, p);
    };
    return {
      ...brand,
      logo_paths: {
        primary: resolvePath(brand.logo_paths.primary),
        white: resolvePath(brand.logo_paths.white),
        dark: resolvePath(brand.logo_paths.dark),
        favicon: resolvePath(brand.logo_paths.favicon),
        placeholder_cover: resolvePath(brand.logo_paths.placeholder_cover),
        placeholder_image: resolvePath(brand.logo_paths.placeholder_image),
      },
    };
  }

  /**
   * Produces the denormalized "snapshot" representation used inside DeckSpecs.
   */
  toDeckBrandRef(brandId: string): DeckBrandRef {
    const brand = this.brands.get(brandId);
    if (!brand) {
      throw new Error(`Brand not found: ${brandId}`);
    }
    return {
      id: brand.id,
      name: brand.name,
      primary_color: brand.colors.primary,
      secondary_color: brand.colors.secondary,
      accent_color: brand.colors.accent,
      background_color: brand.colors.background,
      text_color: brand.colors.text,
      heading_font: brand.fonts.heading,
      body_font: brand.fonts.body,
      logo_path: brand.logo_paths.primary,
      logo_white_path: brand.logo_paths.white,
    };
  }
}

/**
 * The built-in MagmaLabs brand. Always registered so the tool works out of the box.
 */
export const MAGMALABS_BRAND: BrandKit = {
  id: 'magmalabs',
  name: 'MagmaLabs',
  description:
    'MagmaLabs es una consultoría de ingeniería, diseño y equipos para productos digitales escalables.',
  colors: {
    primary: '#f84848',
    secondary: '#000000',
    accent: '#ff7a59',
    background: '#ffffff',
    surface: '#f7f7f8',
    text: '#111111',
    text_muted: '#555555',
    success: '#2fb67b',
    warning: '#e6a822',
    danger: '#d62828',
  },
  fonts: {
    heading: 'Lato',
    body: 'Lato',
    mono: 'Courier New',
  },
  logo_paths: {},
  spacing_rules: {
    safe_margin_inches: 0.5,
    inner_gap_inches: 0.3,
    section_gap_inches: 0.55,
  },
  border_radius: 0.08,
  shadow_style: 'soft',
  preferred_layouts: [
    'hero-cover',
    'capabilities-grid',
    'metrics-grid',
    'case-study-highlight',
    'closing-cta',
  ],
  image_treatment_rules: {
    default_fit: 'cover',
    rounded: true,
    rounded_radius_pct: 6,
    shadow: false,
  },
  default_theme: 'magma',
  page_backgrounds: {
    light: '#ffffff',
    dark: '#0a0a0a',
    accent: '#f84848',
  },
};

export interface CreateBrandRegistryOptions {
  /**
   * If false, the built-in MagmaLabs brand is NOT pre-registered. Useful when
   * you want to start from an empty registry and only load your own brands
   * from disk (e.g. in a white-labeled fork).
   */
  includeBuiltinBrand?: boolean;
}

export function createDefaultBrandRegistry(
  opts: CreateBrandRegistryOptions = {},
): BrandRegistry {
  const registry = new BrandRegistry();
  if (opts.includeBuiltinBrand !== false) {
    registry.register(MAGMALABS_BRAND);
  }
  return registry;
}
