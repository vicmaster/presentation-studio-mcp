import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { BrandKitSchema } from '@presentation-studio/schema';
import { requireStringFlag, getStringFlag, type ParsedArgs } from '../util/args.js';
import { findRepoRoot } from '../util/repo.js';

/**
 * `init-brand` - scaffolds a new brand.json file under assets/brands/<id>/.
 *
 * Required flags: --id, --name, --primary
 * Optional flags: --secondary, --background, --text, --heading-font, --body-font
 *
 * Example:
 *   pnpm cli init-brand --id acme --name "Acme Inc" --primary "#0066FF"
 */
export async function initBrandCommand(args: ParsedArgs): Promise<number> {
  const id = requireStringFlag(args.flags, 'id');
  const name = requireStringFlag(args.flags, 'name');
  const primary = requireStringFlag(args.flags, 'primary');
  const secondary = getStringFlag(args.flags, 'secondary') ?? '#111111';
  const background = getStringFlag(args.flags, 'background') ?? '#ffffff';
  const text = getStringFlag(args.flags, 'text') ?? '#111111';
  const headingFont = getStringFlag(args.flags, 'heading-font') ?? 'Inter';
  const bodyFont = getStringFlag(args.flags, 'body-font') ?? 'Inter';
  const description = getStringFlag(args.flags, 'description') ?? '';

  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    console.error('× --id must be kebab-case: lowercase letters, digits, dashes only.');
    return 1;
  }

  const repoRoot = findRepoRoot();
  const brandsDir = resolve(repoRoot, 'assets/brands', id);

  if (existsSync(join(brandsDir, 'brand.json')) && !args.flags.force) {
    console.error(
      `× ${join(brandsDir, 'brand.json')} already exists. Pass --force to overwrite.`,
    );
    return 1;
  }

  const brand = BrandKitSchema.parse({
    id,
    name,
    description,
    colors: {
      primary,
      secondary,
      background,
      text,
    },
    fonts: {
      heading: headingFont,
      body: bodyFont,
    },
    logo_paths: {},
    default_theme: 'magma',
    preferred_layouts: [
      'hero-cover',
      'capabilities-grid',
      'metrics-grid',
      'case-study-highlight',
      'closing-cta',
    ],
    page_backgrounds: {
      light: background,
      dark: '#0a0a0a',
      accent: primary,
    },
  });

  mkdirSync(brandsDir, { recursive: true });
  const outPath = join(brandsDir, 'brand.json');
  writeFileSync(outPath, JSON.stringify(brand, null, 2) + '\n', 'utf-8');

  console.log(`✓ Brand "${id}" scaffolded at ${outPath}`);
  console.log(`  Add logos by dropping PNGs into ${brandsDir} and updating logo_paths.`);
  console.log(`  The brand will be auto-loaded the next time any CLI or MCP command runs.`);
  return 0;
}
