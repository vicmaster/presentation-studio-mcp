import type { DeckSpec, AuditIssue } from '@presentation-studio/schema';

/**
 * LOW_CONTRAST_RISK - heuristic contrast check between background & text colors.
 * Uses the WCAG relative luminance formula. We flag pairs below 4.5:1.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0]! + cleaned[0]!, 16);
    const g = parseInt(cleaned[1]! + cleaned[1]!, 16);
    const b = parseInt(cleaned[2]! + cleaned[2]!, 16);
    return { r, g, b };
  }
  if (cleaned.length === 6) {
    return {
      r: parseInt(cleaned.slice(0, 2), 16),
      g: parseInt(cleaned.slice(2, 4), 16),
      b: parseInt(cleaned.slice(4, 6), 16),
    };
  }
  return null;
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const channel = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(hexA: string, hexB: string): number | null {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) return null;
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lightest = Math.max(la, lb);
  const darkest = Math.min(la, lb);
  return (lightest + 0.05) / (darkest + 0.05);
}

export function lowContrastRiskRule(deck: DeckSpec): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const bgDefault = deck.brand.background_color;
  const textDefault = deck.brand.text_color;
  const baseline = contrastRatio(bgDefault, textDefault);
  if (baseline !== null && baseline < 4.5) {
    issues.push({
      slide_id: null,
      severity: 'warning',
      code: 'LOW_CONTRAST_RISK',
      message: `El brand kit combina texto ${textDefault} con fondo ${bgDefault}, contraste ${baseline.toFixed(2)}:1 (<4.5:1).`,
      details: { ratio: Number(baseline.toFixed(2)), bg: bgDefault, text: textDefault },
    });
  }
  for (const slide of deck.slides) {
    const overrides = slide.style_overrides ?? {};
    const bg = overrides.background_color ?? slide.background?.color ?? bgDefault;
    const text = overrides.text_color ?? textDefault;
    const r = contrastRatio(bg, text);
    if (r !== null && r < 4.5) {
      issues.push({
        slide_id: slide.id,
        severity: 'warning',
        code: 'LOW_CONTRAST_RISK',
        message: `Contraste bajo entre fondo (${bg}) y texto (${text}): ${r.toFixed(2)}:1.`,
        details: { ratio: Number(r.toFixed(2)), bg, text },
      });
    }
  }
  return issues;
}
