import { dirname } from 'node:path';
import { normalizeDeckSpec } from '@presentation-studio/core';
import {
  renderDeck,
  createDefaultLayoutRegistry,
  createDefaultThemeRegistry,
  consoleLogger,
  silentLogger,
} from '@presentation-studio/renderer';
import { readJson, absolutize } from '../util/io.js';
import { requireStringFlag, getStringFlag, getBoolFlag, type ParsedArgs } from '../util/args.js';
import { loadStudioContext } from '../util/studio.js';

export async function renderCommand(args: ParsedArgs): Promise<number> {
  const input = requireStringFlag(args.flags, 'input');
  const output = requireStringFlag(args.flags, 'output');
  const quiet = getBoolFlag(args.flags, 'quiet');
  const brand = getStringFlag(args.flags, 'brand');

  const studio = loadStudioContext();
  const inputPath = absolutize(input);
  const outputPath = absolutize(output);
  const baseDir = getStringFlag(args.flags, 'base-dir')
    ? absolutize(getStringFlag(args.flags, 'base-dir')!)
    : dirname(inputPath);

  const raw = readJson<unknown>(inputPath);
  const { deck, warnings: normWarnings } = normalizeDeckSpec(raw, {
    brandRegistry: studio.brandRegistry,
    defaultBrandId: brand ?? studio.config.default_brand_id,
  });

  const layoutRegistry = createDefaultLayoutRegistry();
  const themeRegistry = createDefaultThemeRegistry();

  const result = await renderDeck({
    deck,
    outputPath,
    layoutRegistry,
    themeRegistry,
    baseDir,
    logger: quiet ? silentLogger : consoleLogger,
  });

  if (!quiet) {
    console.log(`✓ Rendered ${result.slide_count} slides`);
    console.log(`  → ${result.output_path}`);
    if (normWarnings.length > 0) {
      console.log(`  normalize warnings:`);
      for (const w of normWarnings) console.log(`    - ${w}`);
    }
    if (result.warnings.length > 0) {
      console.log(`  render warnings:`);
      for (const w of result.warnings) console.log(`    - ${w}`);
    }
  }

  return 0;
}
