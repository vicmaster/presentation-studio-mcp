import { loadStudioContext } from '../util/studio.js';

export async function listTemplatesCommand(): Promise<number> {
  const studio = loadStudioContext();
  const templates = studio.templateRegistry.list();
  console.log(`${templates.length} template(s):`);
  for (const t of templates) {
    console.log(`  • ${t.id.padEnd(22)} ${t.name}`);
    console.log(`      ${t.description}`);
    console.log(
      `      audience: ${t.recommended_audience} | slides: ${t.recommended_slide_count.ideal} (${t.recommended_slide_count.min}-${t.recommended_slide_count.max})`,
    );
  }
  if (studio.configSource === 'file') {
    console.log(
      `Config: presentation-studio.config.json (builtin_templates=${studio.config.load_builtin_templates}${studio.config.templates_dir ? `, templates_dir=${studio.config.templates_dir}` : ''})`,
    );
  }
  return 0;
}
