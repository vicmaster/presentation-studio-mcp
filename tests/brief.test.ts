import { describe, it, expect } from 'vitest';
import { BriefSchema, BriefInputSchema } from '@presentation-studio/schema';

describe('BriefSchema', () => {
  it('accepts a minimal valid brief via the input schema', () => {
    const parsed = BriefInputSchema.parse({
      title: 'Test Deck',
      goal: 'Validar el schema',
      audience: 'QA',
      brand_id: 'magmalabs',
    });
    expect(parsed.title).toBe('Test Deck');
  });

  it('rejects a brief without required fields', () => {
    const result = BriefInputSchema.safeParse({ title: 'Solo título' });
    expect(result.success).toBe(false);
  });

  it('applies defaults on a strict brief', () => {
    const parsed = BriefSchema.parse({
      id: 'brief-1',
      title: 'Demo',
      goal: 'Pitch',
      audience: 'Clientes',
      brand_id: 'magmalabs',
    });
    expect(parsed.language).toBe('es');
    expect(parsed.tone).toBe('professional');
    expect(parsed.presentation_type).toBe('generic');
    expect(parsed.max_slides).toBe(12);
    expect(parsed.constraints.require_closing_cta).toBe(true);
  });
});
