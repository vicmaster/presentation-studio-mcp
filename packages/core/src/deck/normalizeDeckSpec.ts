import {
  DeckSpecSchema,
  SlideSpecSchema,
  type DeckSpec,
  type SlideSpec,
} from '@presentation-studio/schema';
import type { BrandRegistry } from '../brands/brandRegistry.js';

export interface NormalizeOptions {
  brandRegistry: BrandRegistry;
  /** If the input omits a brand block, fall back to this brand id. */
  defaultBrandId?: string;
}

/**
 * Accepts a partial deck payload (anything the agent or an example file
 * might produce) and produces a strict, validated DeckSpec.
 *
 * Normalization does several useful things:
 * 1. Fills defaults for meta/theme/assets.
 * 2. Resolves the brand from the brand registry if only an id is provided.
 * 3. Ensures every slide has a unique id (auto-generates missing ones).
 * 4. Runs each slide through SlideSpecSchema, so missing arrays become [].
 */
export function normalizeDeckSpec(
  input: unknown,
  opts: NormalizeOptions,
): { deck: DeckSpec; warnings: string[] } {
  const warnings: string[] = [];
  if (input === null || typeof input !== 'object') {
    throw new Error('normalizeDeckSpec: input must be an object');
  }
  const anyInput = input as Record<string, unknown>;

  // --- meta ---
  const metaIn = (anyInput.meta ?? {}) as Record<string, unknown>;
  const now = new Date().toISOString();
  const meta = {
    title: typeof metaIn.title === 'string' && metaIn.title.length > 0 ? metaIn.title : 'Untitled Deck',
    subtitle: typeof metaIn.subtitle === 'string' ? metaIn.subtitle : undefined,
    language: typeof metaIn.language === 'string' ? metaIn.language : 'es',
    presentation_type:
      typeof metaIn.presentation_type === 'string' ? metaIn.presentation_type : 'generic',
    author: typeof metaIn.author === 'string' ? metaIn.author : 'presentation-studio-mcp',
    version: typeof metaIn.version === 'string' ? metaIn.version : '1.0.0',
    created_at: typeof metaIn.created_at === 'string' ? metaIn.created_at : now,
    updated_at: now,
    tags: Array.isArray(metaIn.tags) ? (metaIn.tags as string[]) : [],
  };

  // --- brand ---
  let brand = anyInput.brand as Record<string, unknown> | undefined;
  const brandIdFromInput = typeof brand?.id === 'string' ? brand.id : undefined;
  const resolvedBrandId = brandIdFromInput ?? opts.defaultBrandId ?? 'magmalabs';
  const hasFullBrand =
    brand && typeof brand.primary_color === 'string' && typeof brand.background_color === 'string';
  if (!hasFullBrand) {
    if (!opts.brandRegistry.has(resolvedBrandId)) {
      throw new Error(
        `Deck references unknown brand "${resolvedBrandId}" and no full brand payload was provided.`,
      );
    }
    brand = opts.brandRegistry.toDeckBrandRef(resolvedBrandId) as unknown as Record<string, unknown>;
    warnings.push(`brand "${resolvedBrandId}" resolved from registry`);
  }

  // --- theme ---
  const themeIn = (anyInput.theme ?? {}) as Record<string, unknown>;
  const theme = {
    id: typeof themeIn.id === 'string' ? themeIn.id : (brand!.default_theme as string) ?? 'magma',
    page_size:
      themeIn.page_size === 'LAYOUT_STANDARD' || themeIn.page_size === 'LAYOUT_16x10'
        ? themeIn.page_size
        : 'LAYOUT_WIDE',
    density:
      themeIn.density === 'minimal' || themeIn.density === 'dense' ? themeIn.density : 'balanced',
    background_style:
      themeIn.background_style === 'dark' || themeIn.background_style === 'accent'
        ? themeIn.background_style
        : 'light',
    show_footer: themeIn.show_footer !== false,
    show_page_numbers: themeIn.show_page_numbers !== false,
    footer_text: typeof themeIn.footer_text === 'string' ? themeIn.footer_text : undefined,
  };

  // --- assets ---
  const assets = Array.isArray(anyInput.assets) ? (anyInput.assets as unknown[]) : [];

  // --- slides ---
  const rawSlides = Array.isArray(anyInput.slides) ? (anyInput.slides as unknown[]) : [];
  if (rawSlides.length === 0) {
    throw new Error('Deck must contain at least one slide');
  }
  const seenIds = new Set<string>();
  const slides: SlideSpec[] = rawSlides.map((raw, idx) => {
    const candidate = (raw ?? {}) as Record<string, unknown>;
    if (typeof candidate.id !== 'string' || candidate.id.length === 0) {
      candidate.id = `slide-${idx + 1}`;
      warnings.push(`slide index ${idx} had no id, assigned "${candidate.id as string}"`);
    }
    if (typeof candidate.layout !== 'string' || candidate.layout.length === 0) {
      candidate.layout = 'two-column-text';
      warnings.push(`slide "${candidate.id as string}" had no layout, defaulting to two-column-text`);
    }
    if (seenIds.has(candidate.id as string)) {
      const fresh = `${candidate.id as string}-${idx + 1}`;
      warnings.push(
        `slide id "${candidate.id as string}" duplicated at index ${idx}, renamed to "${fresh}"`,
      );
      candidate.id = fresh;
    }
    seenIds.add(candidate.id as string);
    // Fill in structural defaults that SlideSpecSchema expects.
    candidate.bullets = Array.isArray(candidate.bullets) ? candidate.bullets : [];
    candidate.items = Array.isArray(candidate.items) ? candidate.items : [];
    candidate.metrics = Array.isArray(candidate.metrics) ? candidate.metrics : [];
    candidate.images = Array.isArray(candidate.images) ? candidate.images : [];
    candidate.logos = Array.isArray(candidate.logos) ? candidate.logos : [];
    candidate.style_overrides = candidate.style_overrides ?? {};
    candidate.layout_options = candidate.layout_options ?? {};
    candidate.hidden = candidate.hidden === true;
    return SlideSpecSchema.parse(candidate);
  });

  const deckCandidate = { meta, brand, theme, assets, slides };
  const deck = DeckSpecSchema.parse(deckCandidate);
  return { deck, warnings };
}
