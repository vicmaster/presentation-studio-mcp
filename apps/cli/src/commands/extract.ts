import { extractFromPptx } from '@presentation-studio/core';
import { absolutize, writeJson } from '../util/io.js';
import { requireStringFlag, getStringFlag, type ParsedArgs } from '../util/args.js';

export async function extractCommand(args: ParsedArgs): Promise<number> {
  const input = absolutize(requireStringFlag(args.flags, 'input'));
  const output = absolutize(getStringFlag(args.flags, 'output') ?? 'tmp/extracted');
  const result = extractFromPptx({ pptxPath: input, outputDir: output, extractMedia: true });
  const jsonPath = `${output}/extraction.json`;
  writeJson(jsonPath, result);
  console.log(`✓ Extracted ${result.slide_count} slides from ${input}`);
  console.log(`  → ${jsonPath}`);
  console.log(`  media: ${result.media.length} file(s)`);
  if (result.warnings.length > 0) {
    console.log(`  warnings:`);
    for (const w of result.warnings) console.log(`    - ${w}`);
  }
  return 0;
}
