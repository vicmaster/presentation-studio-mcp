import {
  DeckSpecSchema,
  SlideSpecSchema,
  type DeckSpec,
  type SlideSpec,
  type SlideSpecUpdate,
} from '@presentation-studio/schema';

export type UpdateMode = 'merge' | 'replace';

export interface UpdateSlideOptions {
  deck: DeckSpec;
  update: SlideSpecUpdate;
  mode?: UpdateMode;
}

/**
 * Updates (or inserts) a slide inside a deck.
 *
 * Modes:
 * - merge:   shallow-merge the patch with the existing slide.
 *            Arrays in the patch replace arrays in the original.
 * - replace: the patch must be a full SlideSpec; it overrides the slide entirely.
 *
 * If the id does not exist, the update is treated as an insert at the end.
 */
export function updateSlideInDeck(opts: UpdateSlideOptions): {
  deck: DeckSpec;
  action: 'updated' | 'inserted';
} {
  const { deck, update, mode = 'merge' } = opts;
  const idx = deck.slides.findIndex((s) => s.id === update.id);

  if (idx === -1) {
    // Insert - the update must therefore contain a full-enough slide.
    const inserted = SlideSpecSchema.parse({
      id: update.id,
      layout: update.layout ?? 'two-column-text',
      title: update.title,
      subtitle: update.subtitle,
      kicker: update.kicker,
      body: update.body,
      bullets: update.bullets ?? [],
      items: update.items ?? [],
      metrics: update.metrics ?? [],
      quote: update.quote,
      quote_author: update.quote_author,
      images: update.images ?? [],
      logos: update.logos ?? [],
      background: update.background,
      cta: update.cta,
      notes: update.notes,
      style_overrides: update.style_overrides ?? {},
      layout_options: update.layout_options ?? {},
      hidden: update.hidden ?? false,
    });
    const newDeck: DeckSpec = {
      ...deck,
      meta: { ...deck.meta, updated_at: new Date().toISOString() },
      slides: [...deck.slides, inserted],
    };
    return { deck: DeckSpecSchema.parse(newDeck), action: 'inserted' };
  }

  const existing = deck.slides[idx] as SlideSpec;
  let nextSlide: SlideSpec;
  if (mode === 'replace') {
    nextSlide = SlideSpecSchema.parse({
      ...update,
      id: existing.id, // protect against accidental id change
    });
  } else {
    nextSlide = SlideSpecSchema.parse({
      ...existing,
      ...stripUndefined(update),
      id: existing.id,
      // Arrays are replaced wholesale when provided, never deep-merged.
      bullets: update.bullets ?? existing.bullets,
      items: update.items ?? existing.items,
      metrics: update.metrics ?? existing.metrics,
      images: update.images ?? existing.images,
      logos: update.logos ?? existing.logos,
      style_overrides: { ...existing.style_overrides, ...(update.style_overrides ?? {}) },
      layout_options: { ...existing.layout_options, ...(update.layout_options ?? {}) },
    });
  }

  const nextSlides = [...deck.slides];
  nextSlides[idx] = nextSlide;
  const newDeck: DeckSpec = {
    ...deck,
    meta: { ...deck.meta, updated_at: new Date().toISOString() },
    slides: nextSlides,
  };
  return { deck: DeckSpecSchema.parse(newDeck), action: 'updated' };
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}
