export const colors = {
  primary: '#D8240F',
  primaryDark: '#A81B0B',
  dark: '#303030',
  text: '#53535B',
  muted: '#8A8A93',
  border: '#E3E3E8',
  background: '#F7F7F7',
  white: '#FFFFFF',
  pink: '#FFDEDE',
  success: '#1E8E3E',
  warning: '#B26A00',
};

/** Colores de estado de la app iOS (stategray / stateyellow / stategreen), con texto legible sobre blanco. */
export const stateColors = {
  enviado: { dot: '#B8BDB7', text: '#6E736D', bg: '#F0F1F0' },
  en_curso: { dot: '#FFD131', text: '#8A6A00', bg: '#FFF6D6' },
  completado: { dot: '#00CA33', text: '#0B7A2A', bg: '#DDF7E4' },
  cancelado: { dot: '#8A8A93', text: '#8A8A93', bg: '#EFEFF2' },
  otro: { dot: '#8A8A93', text: '#53535B', bg: '#EFEFF2' },
};

export const fonts = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  bold: 'Montserrat_700Bold',
};

export const spacing = (n: number) => n * 4;
