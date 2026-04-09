import { dirname } from 'node:path';
import { auditDeck, normalizeDeckSpec } from '@presentation-studio/core';
import { createDefaultLayoutRegistry } from '@presentation-studio/renderer';
import { readJson, absolutize } from '../util/io.js';
import { requireStringFlag, getStringFlag, type ParsedArgs } from '../util/args.js';
import { loadStudioContext } from '../util/studio.js';

export async function auditCommand(args: ParsedArgs): Promise<number> {
  const inputPath = absolutize(requireStringFlag(args.flags, 'input'));
  const outputPath = getStringFlag(args.flags, 'output');

  const studio = loadStudioContext();
  const { deck } = normalizeDeckSpec(readJson(inputPath), {
    brandRegistry: studio.brandRegistry,
    defaultBrandId: studio.config.default_brand_id,
  });
  const layoutRegistry = createDefaultLayoutRegistry();
  const report = auditDeck(deck, {
    knownLayouts: new Set(layoutRegistry.list()),
    baseDir: dirname(inputPath),
  });

  if (outputPath) {
    const { writeJson } = await import('../util/io.js');
    writeJson(absolutize(outputPath), report);
    console.log(`✓ Audit report saved to ${outputPath}`);
  }

  console.log(`Audit for "${deck.meta.title}"`);
  console.log(
    `  slides=${report.summary.slides} info=${report.summary.info} warnings=${report.summary.warnings} errors=${report.summary.errors}`,
  );
  for (const issue of report.issues) {
    const where = issue.slide_id ? `[${issue.slide_id}]` : '[deck]';
    const sev = issue.severity.toUpperCase().padEnd(7);
    console.log(`  ${sev} ${where} ${issue.code}: ${issue.message}`);
  }
  return report.summary.errors === 0 ? 0 : 1;
}
