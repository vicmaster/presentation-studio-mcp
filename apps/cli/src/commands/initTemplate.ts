import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DeckTemplateSchema } from '@presentation-studio/schema';
import { requireStringFlag, getStringFlag, type ParsedArgs } from '../util/args.js';
import { findRepoRoot } from '../util/repo.js';

/**
 * `init-template` - scaffolds a new DeckTemplate as a JSON file.
 *
 * Required flags: --id, --name, --output (path of the .json to create)
 * Optional:       --description, --audience
 *
 * The file ends up in whatever directory you choose. Point
 * `presentation-studio.config.json` at that directory via `templates_dir`
 * so the template loads automatically, or pass it through
 * TemplateRegistry.loadFromDirectory in your own code.
 */
export async function initTemplateCommand(args: ParsedArgs): Promise<number> {
  const id = requireStringFlag(args.flags, 'id');
  const name = requireStringFlag(args.flags, 'name');
  const output = requireStringFlag(args.flags, 'output');
  const description =
    getStringFlag(args.flags, 'description') ??
    `Custom deck template ${id}. Edit the JSON file to tune the slide flow.`;
  const audience = getStringFlag(args.flags, 'audience') ?? 'Your target audience here.';

  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    console.error('× --id must be kebab-case.');
    return 1;
  }

  const repoRoot = findRepoRoot();
  const outPath = resolve(repoRoot, output);
  if (existsSync(outPath) && !args.flags.force) {
    console.error(`× ${outPath} already exists. Pass --force to overwrite.`);
    return 1;
  }

  const template = DeckTemplateSchema.parse({
    id,
    name,
    description,
    recommended_audience: audience,
    recommended_slide_count: { min: 6, max: 12, ideal: 9 },
    density_guidance: 'balanced',
    content_guidance: [
      'Keep each slide to a single clear message.',
      'Use metrics when you can, they make claims concrete.',
    ],
    default_theme: 'magma',
    slide_flow: [
      {
        slide_id: 'cover',
        layout: 'hero-cover',
        purpose: 'Title slide.',
        required_fields: ['title'],
        optional_fields: ['subtitle', 'images'],
        content_hints: ['Short, punchy value proposition.'],
        density: 'minimal',
      },
      {
        slide_id: 'intro',
        layout: 'two-column-text',
        purpose: 'Brief introduction or context.',
        required_fields: ['title', 'body'],
        optional_fields: ['bullets'],
        content_hints: [],
        density: 'balanced',
      },
      {
        slide_id: 'offering',
        layout: 'capabilities-grid',
        purpose: 'What you offer.',
        required_fields: ['title', 'items'],
        optional_fields: [],
        content_hints: ['4-6 cards.'],
        density: 'balanced',
      },
      {
        slide_id: 'metrics',
        layout: 'metrics-grid',
        purpose: 'Proof via numbers.',
        required_fields: ['title', 'metrics'],
        optional_fields: [],
        content_hints: ['3-4 metrics.'],
        density: 'balanced',
      },
      {
        slide_id: 'closing-cta',
        layout: 'closing-cta',
        purpose: 'Closing call to action.',
        required_fields: ['title', 'cta'],
        optional_fields: [],
        content_hints: [],
        density: 'minimal',
      },
    ],
  });

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(template, null, 2) + '\n', 'utf-8');

  console.log(`✓ Template "${id}" scaffolded at ${outPath}`);
  console.log(
    `  Add "templates_dir": "${dirname(output)}" to presentation-studio.config.json to auto-load it.`,
  );
  return 0;
}
