import { randomUUID } from 'node:crypto';
import type {
  Brief,
  DeckSpec,
  DeckTemplate,
  SlideSpec,
  DeckBrandRef,
} from '@presentation-studio/schema';
import { SlideSpecSchema } from '@presentation-studio/schema';
import type { BrandRegistry } from '../brands/brandRegistry.js';
import type { TemplateRegistry } from '../templates/templateRegistry.js';

export interface BuildDeckSpecOptions {
  brief: Brief;
  brandRegistry: BrandRegistry;
  templateRegistry: TemplateRegistry;
  template?: DeckTemplate;
}

/**
 * Turns a Brief into a concrete DeckSpec skeleton. The result is a valid
 * (though empty-content) deck where each slide already has a layout and
 * placeholders for required fields.
 *
 * This is the "plan" step - the agent is then expected to fill in real content
 * or the tool can be called with extras via `updateSlide`.
 */
export function buildDeckSpecFromBrief(opts: BuildDeckSpecOptions): DeckSpec {
  const { brief, brandRegistry, templateRegistry } = opts;

  const brand = brandRegistry.get(brief.brand_id);
  if (!brand) {
    throw new Error(`Unknown brand id "${brief.brand_id}"`);
  }
  const brandRef: DeckBrandRef = brandRegistry.toDeckBrandRef(brief.brand_id);

  const template =
    opts.template ?? templateRegistry.findForPresentationType(brief.presentation_type);
  if (!template) {
    throw new Error(
      `No template available for presentation type "${brief.presentation_type}"`,
    );
  }

  // Respect the brief's max_slides by trimming the flow if needed.
  const flow = template.slide_flow.slice(0, Math.max(1, brief.max_slides));

  const slides: SlideSpec[] = flow.map((blueprint, idx) =>
    SlideSpecSchema.parse({
      id: blueprint.slide_id || `slide-${idx + 1}`,
      layout: blueprint.layout,
      title: seedTitleFor(blueprint.slide_id, brief),
      subtitle: blueprint.slide_id === 'cover' ? brief.goal : undefined,
      kicker: undefined,
      body: blueprint.required_fields.includes('body') ? '' : undefined,
      bullets: blueprint.required_fields.includes('bullets') ? [] : [],
      items: blueprint.required_fields.includes('items') ? [] : [],
      metrics: blueprint.required_fields.includes('metrics') ? [] : [],
      quote: blueprint.required_fields.includes('quote') ? '' : undefined,
      quote_author: blueprint.required_fields.includes('quote_author') ? '' : undefined,
      images: [],
      logos: [],
      notes: blueprint.purpose,
      style_overrides: {},
      layout_options: {
        density: blueprint.density,
      },
      hidden: false,
    }),
  );

  const now = new Date().toISOString();
  const deck: DeckSpec = {
    meta: {
      title: brief.title,
      subtitle: undefined,
      language: brief.language,
      presentation_type: brief.presentation_type,
      author: 'presentation-studio-mcp',
      version: '1.0.0',
      created_at: now,
      updated_at: now,
      tags: [],
    },
    brand: brandRef,
    theme: {
      id: brand.default_theme,
      page_size: 'LAYOUT_WIDE',
      density: template.density_guidance,
      background_style: 'light',
      show_footer: true,
      show_page_numbers: true,
      footer_text: brandRef.name,
    },
    assets: [],
    slides,
  };
  return deck;
}

function seedTitleFor(slideId: string, brief: Brief): string {
  switch (slideId) {
    case 'cover':
      return brief.title;
    case 'agenda':
      return 'Agenda';
    case 'who-we-are':
      return 'Quiénes somos';
    case 'what-we-do':
      return 'Qué hacemos';
    case 'industries':
      return 'Industrias';
    case 'process':
      return 'Nuestro proceso';
    case 'case-studies':
    case 'case-highlight':
      return 'Caso destacado';
    case 'logo-wall':
      return 'Clientes';
    case 'testimonial':
    case 'testimonials':
      return 'Lo que dicen de nosotros';
    case 'why-us':
      return 'Por qué elegirnos';
    case 'team':
      return 'Nuestro equipo';
    case 'closing-cta':
      return 'Hablemos';
    case 'client':
      return 'Sobre el cliente';
    case 'challenge':
      return 'El reto';
    case 'approach':
      return 'Nuestro enfoque';
    case 'solution':
      return 'La solución';
    case 'results':
      return 'Resultados';
    case 'headline':
      return 'Titular del periodo';
    case 'metrics':
      return 'KPIs';
    case 'highlights':
      return 'Highlights';
    case 'lowlights':
      return 'Lowlights y aprendizajes';
    case 'risks':
      return 'Riesgos y bloqueos';
    case 'decisions':
      return 'Decisiones requeridas';
    case 'context':
      return 'Contexto';
    case 'objectives':
      return 'Objetivos';
    case 'scope':
      return 'Alcance';
    case 'timeline':
      return 'Timeline';
    case 'deliverables':
      return 'Entregables';
    case 'investment':
      return 'Inversión';
    case 'next-steps':
      return 'Siguientes pasos';
    default:
      return capitalize(slideId.replace(/-/g, ' '));
  }
}

function capitalize(s: string): string {
  return s.length > 0 ? s[0]!.toUpperCase() + s.slice(1) : s;
}

/** Generate a deterministic id if none is supplied. */
export function generateDeckId(): string {
  return `deck-${randomUUID().slice(0, 8)}`;
}
