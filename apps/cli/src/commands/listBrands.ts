import { loadStudioContext } from '../util/studio.js';

export async function listBrandsCommand(): Promise<number> {
  const studio = loadStudioContext();
  const brands = studio.brandRegistry.list();
  console.log(`${brands.length} brand(s):`);
  for (const b of brands) {
    console.log(`  • ${b.id.padEnd(18)} ${b.name}`);
    console.log(`      ${b.description || '(no description)'}`);
    console.log(`      primary=${b.colors.primary} background=${b.colors.background} text=${b.colors.text}`);
  }
  if (studio.configSource === 'file') {
    console.log(
      `Config: presentation-studio.config.json (default_brand_id=${studio.config.default_brand_id}, builtin_brand=${studio.config.load_builtin_brand})`,
    );
  }
  return 0;
}
