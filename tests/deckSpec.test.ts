import { describe, it, expect } from 'vitest';
import {
  createDefaultBrandRegistry,
  normalizeDeckSpec,
  validateDeckSpec,
} from '@presentation-studio/core';

const registry = createDefaultBrandRegistry();

describe('DeckSpec validation & normalization', () => {
  it('normalizes a partial deck with only meta.title and slide layouts', () => {
    const { deck, warnings } = normalizeDeckSpec(
      {
        meta: { title: 'Small Deck' },
        slides: [
          { id: 'a', layout: 'hero-cover', title: 'Hola' },
          { id: 'b', layout: 'two-column-text', body: 'Body' },
        ],
      },
      { brandRegistry: registry, defaultBrandId: 'magmalabs' },
    );
    expect(deck.slides.length).toBe(2);
    expect(deck.brand.id).toBe('magmalabs');
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('rejects a deck without slides', () => {
    expect(() =>
      normalizeDeckSpec(
        { meta: { title: 'Empty' }, slides: [] },
        { brandRegistry: registry },
      ),
    ).toThrowError();
  });

  it('validateDeckSpec returns structured errors', () => {
    const result = validateDeckSpec({ meta: {}, slides: [] });
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('deduplicates slide ids during normalization', () => {
    const { deck, warnings } = normalizeDeckSpec(
      {
        meta: { title: 'Dup' },
        slides: [
          { id: 'x', layout: 'hero-cover' },
          { id: 'x', layout: 'two-column-text' },
        ],
      },
      { brandRegistry: registry },
    );
    expect(deck.slides[0].id).toBe('x');
    expect(deck.slides[1].id).not.toBe('x');
    expect(warnings.some((w) => w.includes('duplicated'))).toBe(true);
  });
});
