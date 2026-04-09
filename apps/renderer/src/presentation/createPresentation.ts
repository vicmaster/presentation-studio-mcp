import pptxgen from 'pptxgenjs';
import type { DeckSpec } from '@presentation-studio/schema';

/**
 * Creates a PptxGenJS instance configured for the deck's meta/theme.
 * The size mapping comes from the theme's page_size.
 */
export function createPresentation(deck: DeckSpec): pptxgen {
  const pres = new pptxgen();
  pres.layout = deck.theme.page_size;
  pres.title = deck.meta.title;
  if (deck.meta.subtitle) pres.subject = deck.meta.subtitle;
  pres.company = deck.brand.name;
  pres.author = deck.meta.author;
  pres.revision = deck.meta.version;
  return pres;
}
