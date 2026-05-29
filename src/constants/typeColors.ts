export const TYPE_BG: Record<string, string> = {
  // Normal / Effect / misc monster variants → dark amber
  'Monster Card':                   '#1e0e00',
  'Effect Monster':                 '#1e0e00',
  'Normal Monster':                 '#1a0c00',
  'Flip Effect Monster':            '#1e0e00',
  'Flip Tuner Effect Monster':      '#1e0e00',
  'Toon Monster':                   '#1e0e00',
  'Union Effect Monster':           '#1e0e00',
  'Gemini Monster':                 '#1e0e00',
  'Spirit Monster':                 '#1e0e00',
  'Tuner Monster':                  '#1e0e00',

  // Ritual → deep ocean blue
  'Ritual Monster':                 '#00101e',
  'Ritual Effect Monster':          '#00101e',

  // Fusion → deep purple
  'Fusion Monster':                 '#12003a',
  'Fusion Pendulum Effect Monster': '#12003a',

  // Synchro → very dark gray
  'Synchro Monster':                '#121212',
  'Synchro Tuner Monster':          '#121212',
  'Synchro Pendulum Effect Monster':'#121212',

  // XYZ → near black (dark with slight blue-black tint)
  'XYZ Monster':                    '#07050f',
  'XYZ Pendulum Effect Monster':    '#07050f',

  // Link → dark navy
  'Link Monster':                   '#000d26',

  // Pendulum → dark teal
  'Pendulum Effect Monster':        '#001a10',
  'Pendulum Normal Monster':        '#001a10',
  'Pendulum Flip Effect Monster':   '#001a10',

  // Spell → dark forest green
  'Spell Card':                     '#001e0e',

  // Trap → dark rose
  'Trap Card':                      '#1e0012',
};

export const TYPE_COLOR: Record<string, string> = {
  // Normal / Effect monster → orange
  'Monster Card':                   '#fb923c',
  'Effect Monster':                 '#fb923c',
  'Normal Monster':                 '#fbbf24',  // gold — normal cards have a distinct warmth
  'Flip Effect Monster':            '#fb923c',
  'Flip Tuner Effect Monster':      '#fb923c',
  'Toon Monster':                   '#fb923c',
  'Union Effect Monster':           '#fb923c',
  'Gemini Monster':                 '#fb923c',
  'Spirit Monster':                 '#fb923c',
  'Tuner Monster':                  '#fb923c',

  // Ritual → sky blue
  'Ritual Monster':                 '#38bdf8',
  'Ritual Effect Monster':          '#38bdf8',

  // Fusion → violet
  'Fusion Monster':                 '#c084fc',
  'Fusion Pendulum Effect Monster': '#c084fc',

  // Synchro → silver-white
  'Synchro Monster':                '#e2e8f0',
  'Synchro Tuner Monster':          '#e2e8f0',
  'Synchro Pendulum Effect Monster':'#e2e8f0',

  // XYZ → gold/cream
  'XYZ Monster':                    '#d4c88a',
  'XYZ Pendulum Effect Monster':    '#d4c88a',

  // Link → bright blue
  'Link Monster':                   '#60a5fa',

  // Pendulum → teal
  'Pendulum Effect Monster':        '#2dd4bf',
  'Pendulum Normal Monster':        '#2dd4bf',
  'Pendulum Flip Effect Monster':   '#2dd4bf',

  // Spell → vivid green
  'Spell Card':                     '#4ade80',

  // Trap → hot pink
  'Trap Card':                      '#f472b6',
};

export const ATTRIBUTE_COLORS: Record<string, string> = {
  LIGHT:  '#60a0ff',
  DARK:   '#9d6aff',
  FIRE:   '#f87171',
  WATER:  '#22d3ee',
  EARTH:  '#a3e635',
  WIND:   '#34d399',
  DIVINE: '#fde047',
};

export function getTypeBg(type: string): string {
  return TYPE_BG[type] ?? '#1e0e00';
}

export function getTypeColor(type: string): string {
  return TYPE_COLOR[type] ?? '#fb923c';
}

export function getAttributeColor(attribute?: string): string {
  return attribute ? (ATTRIBUTE_COLORS[attribute] ?? '#8060ff') : '#8060ff';
}
