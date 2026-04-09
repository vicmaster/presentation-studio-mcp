import { describe, it, expect } from 'vitest';
import {
  auditDeck,
  createDefaultBrandRegistry,
  normalizeDeckSpec,
} from '@presentation-studio/core';
import { createDefaultLayoutRegistry } from '@presentation-studio/renderer';

const brands = createDefaultBrandRegistry();
const layouts = createDefaultLayoutRegistry();
const known = new Set(layouts.list());

describe('audit rules', () => {
  it('flags text density high on dense slides', () => {
    const { deck } = normalizeDeckSpec(
      {
        meta: { title: 'Dense' },
        slides: [
          {
            id: 'cover',
            layout: 'hero-cover',
            title: 'Una frase que va a ser muy larga sin motivo '.repeat(6),
            body: 'Un párrafo denso '.repeat(80),
          },
        ],
      },
      { brandRegistry: brands },
    );
    const report = auditDeck(deck, { knownLayouts: known });
    const hasDensity = report.issues.some((i) => i.code === 'TEXT_DENSITY_HIGH');
    expect(hasDensity).toBe(true);
  });

  it('flags empty slides', () => {
    const { deck } = normalizeDeckSpec(
      {
        meta: { title: 'Empty slide' },
        slides: [{ id: 'empty', layout: 'two-column-text' }],
      },
      { brandRegistry: brands },
    );
    const report = auditDeck(deck, { knownLayouts: known });
    const hasEmpty = report.issues.some((i) => i.code === 'EMPTY_SLIDE');
    expect(hasEmpty).toBe(true);
  });

  it('flags unknown layouts when not registered', () => {
    const { deck } = normalizeDeckSpec(
      {
        meta: { title: 'Unknown layout' },
        slides: [{ id: 'x', layout: 'this-layout-does-not-exist', title: 'Hi', body: 'Body' }],
      },
      { brandRegistry: brands },
    );
    const report = auditDeck(deck, { knownLayouts: known });
    const hasUnknown = report.issues.some((i) => i.code === 'LAYOUT_UNKNOWN');
    expect(hasUnknown).toBe(true);
  });

  it('detects missing closing CTA for brochure', () => {
    const { deck } = normalizeDeckSpec(
      {
        meta: { title: 'Brochure', presentation_type: 'brochure' },
        slides: [
          { id: 'cover', layout: 'hero-cover', title: 'Hi' },
          { id: 'body', layout: 'two-column-text', title: 'Body', body: 'Content' },
        ],
      },
      { brandRegistry: brands },
    );
    const report = auditDeck(deck, { knownLayouts: known });
    const missing = report.issues.find((i) => i.code === 'CTA_MISSING_ON_CLOSING');
    expect(missing).toBeDefined();
  });
});
