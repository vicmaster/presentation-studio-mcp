/**
 * Typography tokens. Sizes are in points (pt) because PptxGenJS reports them
 * that way. Line heights are multipliers.
 */
export interface TypeStyle {
  fontFace: string;
  fontSize: number;
  bold?: boolean;
  italic?: boolean;
  color: string;
  lineSpacingMultiple?: number;
  charSpacing?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TypographyScale {
  display: TypeStyle;
  title: TypeStyle;
  subtitle: TypeStyle;
  kicker: TypeStyle;
  body: TypeStyle;
  caption: TypeStyle;
  metricValue: TypeStyle;
  metricLabel: TypeStyle;
  quote: TypeStyle;
  cta: TypeStyle;
  footer: TypeStyle;
}

export interface TypographyOptions {
  headingFont: string;
  bodyFont: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
}

export function buildTypographyScale(opts: TypographyOptions): TypographyScale {
  const { headingFont, bodyFont, textColor, mutedColor, accentColor } = opts;
  return {
    display: {
      fontFace: headingFont,
      fontSize: 54,
      bold: true,
      color: textColor,
      lineSpacingMultiple: 1.05,
      charSpacing: -1,
    },
    title: {
      fontFace: headingFont,
      fontSize: 32,
      bold: true,
      color: textColor,
      lineSpacingMultiple: 1.1,
    },
    subtitle: {
      fontFace: headingFont,
      fontSize: 20,
      bold: false,
      color: mutedColor,
      lineSpacingMultiple: 1.2,
    },
    kicker: {
      fontFace: headingFont,
      fontSize: 12,
      bold: true,
      color: accentColor,
      charSpacing: 2,
    },
    body: {
      fontFace: bodyFont,
      fontSize: 14,
      color: textColor,
      lineSpacingMultiple: 1.35,
    },
    caption: {
      fontFace: bodyFont,
      fontSize: 10,
      color: mutedColor,
      lineSpacingMultiple: 1.2,
    },
    metricValue: {
      fontFace: headingFont,
      fontSize: 40,
      bold: true,
      color: accentColor,
      charSpacing: -1,
    },
    metricLabel: {
      fontFace: bodyFont,
      fontSize: 12,
      color: mutedColor,
      lineSpacingMultiple: 1.2,
    },
    quote: {
      fontFace: headingFont,
      fontSize: 26,
      italic: true,
      color: textColor,
      lineSpacingMultiple: 1.25,
    },
    cta: {
      fontFace: headingFont,
      fontSize: 22,
      bold: true,
      color: accentColor,
    },
    footer: {
      fontFace: bodyFont,
      fontSize: 9,
      color: mutedColor,
    },
  };
}
