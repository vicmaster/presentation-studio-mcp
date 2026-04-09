import { describe, it, expect, beforeAll } from 'vitest';
import { mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createDefaultBrandRegistry,
  extractFromPptx,
  normalizeDeckSpec,
} from '@presentation-studio/core';
import {
  createDefaultLayoutRegistry,
  createDefaultThemeRegistry,
  renderDeck,
} from '@presentation-studio/renderer';

let pptxPath: string;
let outputDir: string;

/**
 * We generate a tiny deck ourselves, render it to .pptx and then round-trip
 * the file through the extractor. This gives us a deterministic fixture.
 */
beforeAll(async () => {
  const brands = createDefaultBrandRegistry();
  const { deck } = normalizeDeckSpec(
    {
      meta: { title: 'Extractor fixture' },
      slides: [
        { id: 'cover', layout: 'hero-cover', title: 'Título principal', subtitle: 'Subtítulo' },
        { id: 'body', layout: 'two-column-text', title: 'Sección', body: 'Cuerpo detectable' },
      ],
    },
    { brandRegistry: brands },
  );
  const dir = mkdtempSync(join(tmpdir(), 'psmcp-ext-'));
  pptxPath = join(dir, 'fixture.pptx');
  outputDir = join(dir, 'out');
  await renderDeck({
    deck,
    outputPath: pptxPath,
    layoutRegistry: createDefaultLayoutRegistry(),
    themeRegistry: createDefaultThemeRegistry(),
    baseDir: dir,
  });
});

describe('extractFromPptx', () => {
  it('extracts the correct number of slides', () => {
    const result = extractFromPptx({ pptxPath, outputDir, extractMedia: false });
    expect(result.slide_count).toBe(2);
    expect(existsSync(outputDir)).toBe(true);
  });

  it('recovers the rendered title text', () => {
    const result = extractFromPptx({ pptxPath, outputDir, extractMedia: false });
    const allText = result.slides.flatMap((s) => [s.title ?? '', ...s.text_blocks]).join(' ');
    expect(allText).toContain('Título principal');
    expect(allText).toContain('Cuerpo detectable');
  });
});
