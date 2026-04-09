import { DeckTemplateSchema, type DeckTemplate } from '@presentation-studio/schema';

export const execUpdate: DeckTemplate = DeckTemplateSchema.parse({
  id: 'exec-update',
  name: 'Executive Update',
  description:
    'Update ejecutivo conciso: estado, métricas, bloqueos, decisiones y próximos pasos.',
  recommended_audience: 'C-Level, board, stakeholders ejecutivos.',
  recommended_slide_count: { min: 5, max: 9, ideal: 7 },
  density_guidance: 'balanced',
  content_guidance: [
    'Honestidad antes que optimismo. Si hay bloqueos, menciónalos.',
    'Cada slide debe responder a una pregunta directa del ejecutivo.',
  ],
  default_theme: 'magma',
  slide_flow: [
    {
      slide_id: 'cover',
      layout: 'hero-cover',
      purpose: 'Portada con alcance y fecha.',
      required_fields: ['title'],
      optional_fields: ['subtitle'],
      density: 'minimal',
    },
    {
      slide_id: 'headline',
      layout: 'section-divider',
      purpose: 'Una frase resumen del estado general.',
      required_fields: ['title'],
      optional_fields: ['subtitle'],
      density: 'minimal',
    },
    {
      slide_id: 'metrics',
      layout: 'metrics-grid',
      purpose: 'Métricas clave del periodo.',
      required_fields: ['title', 'metrics'],
      density: 'minimal',
    },
    {
      slide_id: 'highlights',
      layout: 'capabilities-grid',
      purpose: 'Highlights y lowlights.',
      required_fields: ['title', 'items'],
      density: 'balanced',
    },
    {
      slide_id: 'risks',
      layout: 'two-column-text',
      purpose: 'Riesgos y bloqueos.',
      required_fields: ['title', 'bullets'],
      density: 'balanced',
    },
    {
      slide_id: 'decisions',
      layout: 'capabilities-grid',
      purpose: 'Decisiones requeridas.',
      required_fields: ['title', 'items'],
      density: 'balanced',
    },
    {
      slide_id: 'closing-cta',
      layout: 'closing-cta',
      purpose: 'Siguientes pasos y owners.',
      required_fields: ['title'],
      optional_fields: ['cta'],
      density: 'minimal',
    },
  ],
});
