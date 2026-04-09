import { dirname } from 'node:path';
import { auditDeck, buildPreviewManifest, normalizeDeckSpec } from '@presentation-studio/core';
import { createDefaultLayoutRegistry } from '@presentation-studio/renderer';
import { readJson, writeJson, absolutize } from '../util/io.js';
import { requireStringFlag, getStringFlag, type ParsedArgs } from '../util/args.js';
import { loadStudioContext } from '../util/studio.js';

export async function previewCommand(args: ParsedArgs): Promise<number> {
  const inputPath = absolutize(requireStringFlag(args.flags, 'input'));
  const outputPath = absolutize(getStringFlag(args.flags, 'output') ?? 'tmp/preview-manifest.json');

  const studio = loadStudioContext();
  const { deck } = normalizeDeckSpec(readJson(inputPath), {
    brandRegistry: studio.brandRegistry,
    defaultBrandId: studio.config.default_brand_id,
  });
  const layoutRegistry = createDefaultLayoutRegistry();
  const audit = auditDeck(deck, {
    knownLayouts: new Set(layoutRegistry.list()),
    baseDir: dirname(inputPath),
  });
  const manifest = buildPreviewManifest({ deck, audit });
  writeJson(outputPath, manifest);
  console.log(`✓ Preview manifest saved to ${outputPath}`);
  console.log(`  deck: "${manifest.deck_title}", slides=${manifest.slide_count}`);
  for (const slide of manifest.slides) {
    console.log(
      `  #${slide.index + 1} ${slide.slide_id.padEnd(18)} layout=${slide.layout.padEnd(22)} density=${slide.density_label.padEnd(10)} words=${slide.word_count}`,
    );
  }
  return 0;
}
