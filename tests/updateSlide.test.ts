import { describe, it, expect } from 'vitest';
import {
  createDefaultBrandRegistry,
  normalizeDeckSpec,
  updateSlideInDeck,
} from '@presentation-studio/core';

const brands = createDefaultBrandRegistry();

function makeDeck() {
  const { deck } = normalizeDeckSpec(
    {
      meta: { title: 'Test' },
      slides: [
        { id: 'cover', layout: 'hero-cover', title: 'Cover' },
        { id: 'body', layout: 'two-column-text', title: 'Body', body: 'Original body' },
      ],
    },
    { brandRegistry: brands },
  );
  return deck;
}

describe('update_slide', () => {
  it('merges a title change without losing the body', () => {
    const deck = makeDeck();
    const result = updateSlideInDeck({
      deck,
      update: { id: 'body', title: 'New title' },
      mode: 'merge',
    });
    expect(result.action).toBe('updated');
    const bodySlide = result.deck.slides.find((s) => s.id === 'body')!;
    expect(bodySlide.title).toBe('New title');
    expect(bodySlide.body).toBe('Original body');
  });

  it('replace mode overrides the whole slide', () => {
    const deck = makeDeck();
    const result = updateSlideInDeck({
      deck,
      update: { id: 'body', layout: 'quote-slide', quote: '"Hola"' },
      mode: 'replace',
    });
    const bodySlide = result.deck.slides.find((s) => s.id === 'body')!;
    expect(bodySlide.layout).toBe('quote-slide');
    expect(bodySlide.body).toBeUndefined();
  });

  it('inserts a slide when the id does not exist', () => {
    const deck = makeDeck();
    const result = updateSlideInDeck({
      deck,
      update: { id: 'closing-cta', layout: 'closing-cta', title: 'CTA' },
    });
    expect(result.action).toBe('inserted');
    expect(result.deck.slides.length).toBe(3);
  });
});
