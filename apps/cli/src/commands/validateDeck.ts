import { validateDeckSpec } from '@presentation-studio/core';
import { readJson, absolutize } from '../util/io.js';
import { requireStringFlag, type ParsedArgs } from '../util/args.js';

export async function validateDeckCommand(args: ParsedArgs): Promise<number> {
  const input = absolutize(requireStringFlag(args.flags, 'input'));
  const raw = readJson(input);
  const result = validateDeckSpec(raw);
  if (result.ok) {
    console.log(`✓ Deck valid: "${result.deck!.meta.title}" (${result.deck!.slides.length} slides)`);
    return 0;
  }
  console.error(`× Deck invalid:`);
  for (const err of result.errors) {
    console.error(`  ${err.path}: ${err.message}`);
  }
  return 1;
}
