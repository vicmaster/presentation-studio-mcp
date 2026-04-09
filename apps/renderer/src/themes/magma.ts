import type { ThemeDefinition } from '../themeRegistry.js';
import { lighten, darken } from '../utils/colorUtils.js';

export const magmaTheme: ThemeDefinition = {
  id: 'magma',
  name: 'Magma',
  description:
    'Tema premium para consultoría tech. Fondo claro, acentos rojos, alta jerarquía tipográfica.',
  buildColors: (deck) => ({
    background: deck.brand.background_color.replace('#', '').toUpperCase(),
    surface: lighten(deck.brand.background_color.replace('#', ''), 0.02),
    text: deck.brand.text_color.replace('#', '').toUpperCase(),
    textMuted: darken(deck.brand.background_color.replace('#', ''), 0.45),
    accent: deck.brand.primary_color.replace('#', '').toUpperCase(),
    primary: deck.brand.primary_color.replace('#', '').toUpperCase(),
    secondary: deck.brand.secondary_color.replace('#', '').toUpperCase(),
  }),
};
