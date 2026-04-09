import { describe, it, expect } from 'vitest';
import { mkdtempSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createDefaultBrandRegistry,
  normalizeDeckSpec,
} from '@presentation-studio/core';
import {
  createDefaultLayoutRegistry,
  createDefaultThemeRegistry,
  renderDeck,
} from '@presentation-studio/renderer';

describe('renderDeck', () => {
  it('produces a non-empty .pptx file for a minimal deck', async () => {
    const brands = createDefaultBrandRegistry();
    const { deck } = normalizeDeckSpec(
      {
        meta: { title: 'Minimal render test' },
        slides: [
          {
            id: 'cover',
            layout: 'hero-cover',
            title: 'Hola Mundo',
            subtitle: 'Renderer smoke test',
          },
          {
            id: 'body',
            layout: 'two-column-text',
            title: 'Sección',
            body: 'Párrafo de prueba para confirmar que el texto se coloca.',
            bullets: ['Bullet uno', 'Bullet dos'],
          },
        ],
      },
      { brandRegistry: brands },
    );
    const layouts = createDefaultLayoutRegistry();
    const themes = createDefaultThemeRegistry();
    const dir = mkdtempSync(join(tmpdir(), 'psmcp-render-'));
    const outputPath = join(dir, 'deck.pptx');
    const result = await renderDeck({
      deck,
      outputPath,
      layoutRegistry: layouts,
      themeRegistry: themes,
      baseDir: dir,
    });
    expect(result.slide_count).toBe(2);
    expect(existsSync(result.output_path)).toBe(true);
    expect(statSync(result.output_path).size).toBeGreaterThan(1000);
  });

  it('falls back when the layout is unknown and still produces a deck', async () => {
    const brands = createDefaultBrandRegistry();
    const { deck } = normalizeDeckSpec(
      {
        meta: { title: 'Fallback test' },
        slides: [{ id: 'x', layout: 'brand-new-unknown-layout', title: 'Oops', body: 'Body' }],
      },
      { brandRegistry: brands },
    );
    const layouts = createDefaultLayoutRegistry();
    const themes = createDefaultThemeRegistry();
    const dir = mkdtempSync(join(tmpdir(), 'psmcp-fb-'));
    const result = await renderDeck({
      deck,
      outputPath: join(dir, 'fb.pptx'),
      layoutRegistry: layouts,
      themeRegistry: themes,
      baseDir: dir,
    });
    expect(result.slide_count).toBe(1);
    expect(result.warnings.some((w) => w.includes('fallback'))).toBe(true);
  });
});
