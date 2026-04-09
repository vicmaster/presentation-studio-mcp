import type { ThemeDefinition } from '../themeRegistry.js';
import { lighten, darken } from '../utils/colorUtils.js';

export const minimalTheme: ThemeDefinition = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Tema minimalista, muy tipográfico, blanco y negro con acentos sutiles.',
  buildColors: (deck) => ({
    background: 'FFFFFF',
    surface: 'F7F7F8',
    text: '111111',
    textMuted: darken('FFFFFF', 0.55),
    accent: deck.brand.primary_color.replace('#', '').toUpperCase(),
    primary: deck.brand.primary_color.replace('#', '').toUpperCase(),
    secondary: '111111',
  }),
};
