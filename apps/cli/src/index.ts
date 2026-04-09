#!/usr/bin/env node
/**
 * presentation-studio CLI entry point.
 *
 * Usage:
 *   pnpm cli <command> [--flags]
 *
 * Commands:
 *   render         - generate a .pptx from a deck spec
 *   audit          - run audit rules against a deck spec
 *   preview        - produce a preview manifest
 *   extract        - extract text/media from an existing .pptx
 *   prepare-assets - run a Pillow asset preparation plan
 *   validate-deck  - validate a deck spec JSON file
 *   list-templates - print registered deck templates
 *   list-brands    - print registered brands
 *   init-brand     - scaffold a new brand.json under assets/brands/<id>/
 *   init-template  - scaffold a new JSON template
 */
import { parseArgs } from './util/args.js';
import { renderCommand } from './commands/render.js';
import { auditCommand } from './commands/audit.js';
import { previewCommand } from './commands/preview.js';
import { extractCommand } from './commands/extract.js';
import { prepareAssetsCommand } from './commands/prepareAssets.js';
import { validateDeckCommand } from './commands/validateDeck.js';
import { listTemplatesCommand } from './commands/listTemplates.js';
import { listBrandsCommand } from './commands/listBrands.js';
import { initBrandCommand } from './commands/initBrand.js';
import { initTemplateCommand } from './commands/initTemplate.js';

function printHelp(): void {
  console.log(`presentation-studio CLI

Commands:
  render           Render a deck spec to .pptx (--input <spec.json> --output <file.pptx>)
  audit            Audit a deck spec (--input <spec.json> [--output report.json])
  preview          Build a preview manifest (--input <spec.json> [--output manifest.json])
  extract          Extract content from .pptx (--input <file.pptx> [--output dir])
  prepare-assets   Run an asset preparation plan (--input <plan.json> [--output manifest.json])
  validate-deck    Validate a deck spec JSON (--input <spec.json>)
  list-templates   List registered deck templates
  list-brands      List registered brands
  init-brand       Scaffold a new brand kit
                     --id <kebab-case> --name <string> --primary <#hex>
                     [--secondary --background --text --heading-font --body-font --description --force]
  init-template    Scaffold a new JSON deck template
                     --id <kebab-case> --name <string> --output <path.json>
                     [--description --audience --force]
  help             Show this message
`);
}

async function main(): Promise<number> {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === 'help' || argv[0] === '--help') {
    printHelp();
    return 0;
  }
  const [command, ...rest] = argv;
  const parsed = parseArgs(rest);
  try {
    switch (command) {
      case 'render':
        return await renderCommand(parsed);
      case 'audit':
        return await auditCommand(parsed);
      case 'preview':
        return await previewCommand(parsed);
      case 'extract':
        return await extractCommand(parsed);
      case 'prepare-assets':
        return await prepareAssetsCommand(parsed);
      case 'validate-deck':
        return await validateDeckCommand(parsed);
      case 'list-templates':
        return await listTemplatesCommand();
      case 'list-brands':
        return await listBrandsCommand();
      case 'init-brand':
        return await initBrandCommand(parsed);
      case 'init-template':
        return await initTemplateCommand(parsed);
      default:
        console.error(`Unknown command: ${command}\n`);
        printHelp();
        return 1;
    }
  } catch (err) {
    console.error(`× ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }
}

main().then((code) => process.exit(code));
