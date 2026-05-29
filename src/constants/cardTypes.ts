export const EXTRA_DECK_TYPES: string[] = [
  'Fusion Monster',
  'Synchro Monster',
  'XYZ Monster',
  'Link Monster',
  'Synchro Pendulum Effect Monster',
  'XYZ Pendulum Effect Monster',
  'Fusion Pendulum Effect Monster',
];

export const MONSTER_TYPES: string[] = [
  'Effect Monster',
  'Normal Monster',
  'Ritual Monster',
  'Pendulum Effect Monster',
  'Normal Pendulum Monster',
  'Flip Effect Monster',
  'Spirit Monster',
  'Union Effect Monster',
  'Gemini Monster',
  'Tuner Monster',
];

export const ALL_TYPES: string[] = [
  ...MONSTER_TYPES,
  ...EXTRA_DECK_TYPES,
  'Spell Card',
  'Trap Card',
];

export const BASIC_FILTER_CATEGORIES = [
  { label: 'Monstruo', value: 'Effect Monster' },
  { label: 'Magia', value: 'Spell Card' },
  { label: 'Trampa', value: 'Trap Card' },
];

export const ATTRIBUTES = ['DARK', 'LIGHT', 'EARTH', 'WATER', 'FIRE', 'WIND', 'DIVINE'];

export const RACES = [
  'Aqua', 'Beast', 'Beast-Warrior', 'Creator-God', 'Cyberse', 'Dinosaur',
  'Divine-Beast', 'Dragon', 'Fairy', 'Fiend', 'Fish', 'Insect', 'Machine',
  'Plant', 'Psychic', 'Pyro', 'Reptile', 'Rock', 'Sea Serpent', 'Spellcaster',
  'Thunder', 'Warrior', 'Winged Beast', 'Wyrm', 'Zombie',
];

export const LEVELS = ['1','2','3','4','5','6','7','8','9','10','11','12'];

export const FORMATS = [
  { label: 'TCG', value: 'tcg' },
  { label: 'OCG', value: 'ocg' },
  { label: 'Goat', value: 'goat' },
];
