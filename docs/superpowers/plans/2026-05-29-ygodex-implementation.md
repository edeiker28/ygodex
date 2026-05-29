# YGODEX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir YGODEX, una SPA React 19 con Carta-Dex (búsqueda/filtrado de cartas Yu-Gi-Oh) y Deck Builder integrado, consumiendo la API pública de YGOPRODeck.

**Architecture:** 16 tareas en orden estricto de dependencias: scaffold → tipos → utils (TDD) → API → stores → hooks → layout → componentes → páginas → deploy. Cada tarea produce código compilable y un commit atómico.

**Tech Stack:** React 19, Vite (latest), TypeScript 5, TailwindCSS 3 (`darkMode: 'class'`), TanStack Query 5, Zustand 5 + persist, React Router 7 (`createBrowserRouter`), Framer Motion 12, Vitest + React Testing Library. Fuentes: Russo One (headings) + Chakra Petch (body).

---

## File Map

```
yugioh/
├── src/
│   ├── api/
│   │   ├── cards.ts
│   │   └── __tests__/cards.test.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── ChipDeck.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Layout.tsx
│   │   ├── cards/
│   │   │   ├── TypeBadge.tsx
│   │   │   ├── BanBadge.tsx
│   │   │   ├── CardMini.tsx
│   │   │   ├── CardGrid.tsx
│   │   │   └── CardDetail.tsx
│   │   └── deck/
│   │       ├── DeckZone.tsx
│   │       ├── DeckMiniGrid.tsx
│   │       ├── LevelCurve.tsx
│   │       └── DeckStats.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Cards.tsx
│   │   ├── CardDetail.tsx
│   │   ├── Decks.tsx
│   │   └── DeckBuilder.tsx
│   ├── store/
│   │   ├── deckStore.ts
│   │   ├── themeStore.ts
│   │   └── __tests__/deckStore.test.ts
│   ├── hooks/
│   │   ├── useCardSearch.ts
│   │   ├── useCardDetail.ts
│   │   └── useDeckBuilder.ts
│   ├── types/
│   │   └── ygo.ts
│   ├── constants/
│   │   ├── typeColors.ts
│   │   ├── cardTypes.ts
│   │   └── deckRules.ts
│   ├── utils/
│   │   ├── deckValidator.ts
│   │   ├── ydkExporter.ts
│   │   ├── priceCalc.ts
│   │   └── __tests__/
│   │       ├── deckValidator.test.ts
│   │       ├── ydkExporter.test.ts
│   │       └── priceCalc.test.ts
│   ├── router.tsx
│   ├── main.tsx
│   ├── index.css
│   └── test-setup.ts
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── vercel.json
└── tsconfig.json
```

---

### Task 1: Scaffold del Proyecto

**Files:**
- Create: `package.json` (via Vite scaffold)
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `src/index.css`
- Create: `src/test-setup.ts`
- Modify: `index.html`

- [ ] **Step 1: Scaffold Vite React-TS en el directorio actual**

```powershell
# Desde C:\proyectos\yugioh\
npm create vite@latest . -- --template react-ts
# Cuando pregunte "Current directory is not empty": seleccionar "Ignore files and continue"
```

- [ ] **Step 2: Instalar todas las dependencias**

```powershell
npm install react-router-dom @tanstack/react-query zustand framer-motion
npm install -D tailwindcss@3 postcss autoprefixer
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Configurar tailwind.config.ts**

Reemplazar el contenido de `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Russo One"', 'sans-serif'],
        body: ['"Chakra Petch"', 'sans-serif'],
      },
      colors: {
        bg: '#08040f',
        surface: '#100820',
        surface2: '#180c30',
        primary: '#8060ff',
        primary2: '#60a0ff',
        'text-main': '#c0d8ff',
        'text-secondary': '#d0c8f0',
        muted: '#5a4a8a',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Configurar src/index.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Russo+One&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Chakra Petch', sans-serif;
  }

  /* Light mode overrides (dark is default via JS) */
  html:not(.dark) {
    --bg-override: #f5f3ff;
  }
}

@layer utilities {
  .brand-gradient {
    background: linear-gradient(90deg, #8060ff, #60a0ff, #c0d8ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .glow-primary {
    box-shadow: 0 0 10px #8060ff55;
  }
}
```

- [ ] **Step 5: Configurar vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
});
```

- [ ] **Step 6: Crear src/test-setup.ts**

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 7: Añadir Google Fonts al index.html**

Reemplazar la línea `<title>` en `index.html` con:

```html
    <title>YGODEX</title>
    <meta name="description" content="Yu-Gi-Oh Card Database & Deck Builder" />
```

- [ ] **Step 8: Actualizar package.json con script de test**

En `package.json`, agregar en `"scripts"`:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 9: Verificar que el build y los tests funcionan**

```powershell
npm run build
npm run test:run
```

Expected: build completo sin errores, 0 tests (todavía no hay tests escritos).

- [ ] **Step 10: Commit**

```powershell
git add -A
git commit -m "feat: scaffold React 19 + Vite + Tailwind + Vitest"
```

---

### Task 2: Tipos y Constantes

**Files:**
- Create: `src/types/ygo.ts`
- Create: `src/constants/typeColors.ts`
- Create: `src/constants/cardTypes.ts`
- Create: `src/constants/deckRules.ts`

*(No tests — son type definitions y constantes puras)*

- [ ] **Step 1: Crear src/types/ygo.ts**

```typescript
export interface CardImage {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped: string;
}

export interface CardPrice {
  cardmarket_price: string;
  tcgplayer_price: string;
  ebay_price: string;
  amazon_price: string;
  coolstuffinc_price: string;
}

export interface BanlistInfo {
  ban_tcg?: 'Banned' | 'Limited' | 'Semi-Limited';
  ban_ocg?: 'Banned' | 'Limited' | 'Semi-Limited';
  ban_goat?: 'Banned' | 'Limited' | 'Semi-Limited';
}

export interface YGOCard {
  id: number;
  name: string;
  type: string;
  frameType: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  rank?: number;
  linkval?: number;
  race: string;
  attribute?: string;
  archetype?: string;
  card_images: CardImage[];
  card_prices: CardPrice[];
  banlist_info?: BanlistInfo;
}

export type DeckZoneType = 'main' | 'extra' | 'side';
export type BanlistStatus = 'Banned' | 'Limited' | 'Semi-Limited' | 'Unlimited';
export type CardAttribute = 'LIGHT' | 'DARK' | 'FIRE' | 'WATER' | 'EARTH' | 'WIND' | 'DIVINE';
export type BanFormat = 'tcg' | 'ocg' | 'goat';

export interface DeckCard {
  card: YGOCard;
  count: number;
}

export interface Deck {
  id: string;
  name: string;
  main: DeckCard[];
  extra: DeckCard[];
  side: DeckCard[];
  createdAt: number;
  updatedAt: number;
}

export interface CardFilters {
  fname?: string;
  type?: string;
  attribute?: string;
  race?: string;
  archetype?: string;
  level?: string;
  atkMin?: number;
  atkMax?: number;
  defMin?: number;
  defMax?: number;
  format?: BanFormat;
}
```

- [ ] **Step 2: Crear src/constants/typeColors.ts**

```typescript
export const TYPE_BG: Record<string, string> = {
  'Monster Card': '#2a1800',
  'Effect Monster': '#2a1800',
  'Normal Monster': '#2a1800',
  'Ritual Monster': '#001a2a',
  'Fusion Monster': '#1a0038',
  'Synchro Monster': '#1a1a1a',
  'XYZ Monster': '#e8e0cc',
  'Link Monster': '#001a3a',
  'Pendulum Effect Monster': '#2a1800',
  'Spell Card': '#002a14',
  'Trap Card': '#2a0016',
};

export const TYPE_COLOR: Record<string, string> = {
  'Monster Card': '#f97316',
  'Effect Monster': '#f97316',
  'Normal Monster': '#f97316',
  'Ritual Monster': '#38bdf8',
  'Fusion Monster': '#c084fc',
  'Synchro Monster': '#e2e8f0',
  'XYZ Monster': '#080806',
  'Link Monster': '#60a5fa',
  'Pendulum Effect Monster': '#f97316',
  'Spell Card': '#4ade80',
  'Trap Card': '#f472b6',
};

export const ATTRIBUTE_COLORS: Record<string, string> = {
  LIGHT: '#60a0ff',
  DARK: '#8040cc',
  FIRE: '#ef4444',
  WATER: '#06b6d4',
  EARTH: '#84cc16',
  WIND: '#34d399',
  DIVINE: '#ffd700',
};

export function getTypeBg(type: string): string {
  return TYPE_BG[type] ?? '#2a1800';
}

export function getTypeColor(type: string): string {
  return TYPE_COLOR[type] ?? '#f97316';
}

export function getAttributeColor(attribute?: string): string {
  return attribute ? (ATTRIBUTE_COLORS[attribute] ?? '#8060ff') : '#8060ff';
}
```

- [ ] **Step 3: Crear src/constants/cardTypes.ts**

```typescript
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
```

- [ ] **Step 4: Crear src/constants/deckRules.ts**

```typescript
export const MIN_MAIN = 40;
export const MAX_MAIN = 60;
export const MAX_EXTRA = 15;
export const MAX_SIDE = 15;
export const MAX_COPIES = 3;
```

- [ ] **Step 5: Commit**

```powershell
git add src/types src/constants
git commit -m "feat: add TypeScript types and design constants"
```

---

### Task 3: Utilidades con TDD

**Files:**
- Create: `src/utils/deckValidator.ts`
- Create: `src/utils/ydkExporter.ts`
- Create: `src/utils/priceCalc.ts`
- Create: `src/utils/__tests__/deckValidator.test.ts`
- Create: `src/utils/__tests__/ydkExporter.test.ts`
- Create: `src/utils/__tests__/priceCalc.test.ts`

- [ ] **Step 1: Escribir test fallido para deckValidator**

Crear `src/utils/__tests__/deckValidator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  isExtraDeckCard,
  getCardBanLimit,
  canAddCard,
  validateDeck,
} from '../deckValidator';
import type { YGOCard, DeckCard } from '../../types/ygo';

const makeCard = (overrides: Partial<YGOCard> = {}): YGOCard => ({
  id: 1,
  name: 'Test Card',
  type: 'Effect Monster',
  frameType: 'effect',
  desc: 'Test',
  race: 'Dragon',
  card_images: [],
  card_prices: [],
  ...overrides,
});

const dc = (card: YGOCard, count: number): DeckCard => ({ card, count });

describe('isExtraDeckCard', () => {
  it('returns true for Fusion Monster', () =>
    expect(isExtraDeckCard(makeCard({ type: 'Fusion Monster' }))).toBe(true));
  it('returns false for Effect Monster', () =>
    expect(isExtraDeckCard(makeCard())).toBe(false));
  it('returns true for Link Monster', () =>
    expect(isExtraDeckCard(makeCard({ type: 'Link Monster' }))).toBe(true));
});

describe('getCardBanLimit', () => {
  it('returns 3 for unlimited card', () =>
    expect(getCardBanLimit(makeCard())).toBe(3));
  it('returns 0 for banned card', () =>
    expect(getCardBanLimit(makeCard({ banlist_info: { ban_tcg: 'Banned' } }))).toBe(0));
  it('returns 1 for limited card', () =>
    expect(getCardBanLimit(makeCard({ banlist_info: { ban_tcg: 'Limited' } }))).toBe(1));
  it('returns 2 for semi-limited card', () =>
    expect(getCardBanLimit(makeCard({ banlist_info: { ban_tcg: 'Semi-Limited' } }))).toBe(2));
  it('respects ocg format', () =>
    expect(getCardBanLimit(makeCard({ banlist_info: { ban_ocg: 'Banned' } }), 'ocg')).toBe(0));
});

describe('canAddCard', () => {
  it('allows adding when zone is empty', () =>
    expect(canAddCard(makeCard(), [])).toBe(true));
  it('denies when count already at 3', () =>
    expect(canAddCard(makeCard(), [dc(makeCard(), 3)])).toBe(false));
  it('denies adding banned card', () =>
    expect(canAddCard(makeCard({ banlist_info: { ban_tcg: 'Banned' } }), [])).toBe(false));
  it('allows limited card once', () => {
    const card = makeCard({ banlist_info: { ban_tcg: 'Limited' } });
    expect(canAddCard(card, [])).toBe(true);
    expect(canAddCard(card, [dc(card, 1)])).toBe(false);
  });
});

describe('validateDeck', () => {
  const zone40 = [dc(makeCard(), 40)];
  it('valid for 40-card main deck', () => {
    const r = validateDeck(zone40, [], []);
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });
  it('error for less than 40 main cards', () => {
    const r = validateDeck([dc(makeCard(), 39)], [], []);
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toContain('40');
  });
  it('error for more than 60 main cards', () => {
    const r = validateDeck([dc(makeCard(), 61)], [], []);
    expect(r.valid).toBe(false);
  });
  it('error for more than 15 extra cards', () => {
    const r = validateDeck(zone40, [dc(makeCard(), 16)], []);
    expect(r.valid).toBe(false);
  });
  it('error for more than 15 side cards', () => {
    const r = validateDeck(zone40, [], [dc(makeCard(), 16)]);
    expect(r.valid).toBe(false);
  });
});
```

- [ ] **Step 2: Verificar que el test falla**

```powershell
npx vitest run src/utils/__tests__/deckValidator.test.ts
```

Expected: FAIL — `Cannot find module '../deckValidator'`

- [ ] **Step 3: Implementar src/utils/deckValidator.ts**

```typescript
import { EXTRA_DECK_TYPES } from '../constants/cardTypes';
import { MAX_COPIES, MIN_MAIN, MAX_MAIN, MAX_EXTRA, MAX_SIDE } from '../constants/deckRules';
import type { YGOCard, DeckCard, BanFormat } from '../types/ygo';

export function isExtraDeckCard(card: YGOCard): boolean {
  return EXTRA_DECK_TYPES.includes(card.type);
}

export function getCardBanLimit(card: YGOCard, format: BanFormat = 'tcg'): number {
  const info = card.banlist_info;
  if (!info) return MAX_COPIES;
  const status =
    format === 'tcg' ? info.ban_tcg :
    format === 'ocg' ? info.ban_ocg :
    info.ban_goat;
  if (status === 'Banned') return 0;
  if (status === 'Limited') return 1;
  if (status === 'Semi-Limited') return 2;
  return MAX_COPIES;
}

export function canAddCard(
  card: YGOCard,
  zone: DeckCard[],
  format: BanFormat = 'tcg',
): boolean {
  const existing = zone.find(dc => dc.card.id === card.id);
  const currentCount = existing?.count ?? 0;
  return currentCount < getCardBanLimit(card, format);
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDeck(
  main: DeckCard[],
  extra: DeckCard[],
  side: DeckCard[],
): ValidationResult {
  const errors: string[] = [];
  const mainCount = main.reduce((s, dc) => s + dc.count, 0);
  const extraCount = extra.reduce((s, dc) => s + dc.count, 0);
  const sideCount = side.reduce((s, dc) => s + dc.count, 0);

  if (mainCount < MIN_MAIN) errors.push(`Main Deck necesita mínimo ${MIN_MAIN} cartas (tiene ${mainCount})`);
  if (mainCount > MAX_MAIN) errors.push(`Main Deck no puede superar ${MAX_MAIN} cartas`);
  if (extraCount > MAX_EXTRA) errors.push(`Extra Deck no puede superar ${MAX_EXTRA} cartas`);
  if (sideCount > MAX_SIDE) errors.push(`Side Deck no puede superar ${MAX_SIDE} cartas`);

  return { valid: errors.length === 0, errors };
}
```

- [ ] **Step 4: Verificar que el test pasa**

```powershell
npx vitest run src/utils/__tests__/deckValidator.test.ts
```

Expected: PASS — 12 tests passed.

- [ ] **Step 5: Escribir test para ydkExporter**

Crear `src/utils/__tests__/ydkExporter.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { exportToYdk, getYdkFilename } from '../ydkExporter';
import type { Deck, YGOCard } from '../../types/ygo';

const makeCard = (id: number): YGOCard => ({
  id,
  name: `Card ${id}`,
  type: 'Effect Monster',
  frameType: 'effect',
  desc: '',
  race: 'Dragon',
  card_images: [],
  card_prices: [],
});

const deck: Deck = {
  id: '1',
  name: 'Test Deck',
  main: [{ card: makeCard(1), count: 3 }, { card: makeCard(2), count: 1 }],
  extra: [{ card: makeCard(3), count: 2 }],
  side: [{ card: makeCard(4), count: 1 }],
  createdAt: 0,
  updatedAt: 0,
};

describe('exportToYdk', () => {
  it('starts with #main header', () => {
    const ydk = exportToYdk(deck);
    expect(ydk).toContain('#main');
  });
  it('expands count correctly — 3 copies of card 1', () => {
    const ydk = exportToYdk(deck);
    const lines = ydk.split('\n');
    const mainStart = lines.indexOf('#main') + 1;
    const extraStart = lines.indexOf('#extra');
    const mainLines = lines.slice(mainStart, extraStart);
    expect(mainLines.filter(l => l === '1')).toHaveLength(3);
  });
  it('includes !side section', () => {
    expect(exportToYdk(deck)).toContain('!side');
  });
  it('puts extra deck cards between #extra and !side', () => {
    const ydk = exportToYdk(deck);
    const lines = ydk.split('\n');
    const extraStart = lines.indexOf('#extra') + 1;
    const sideStart = lines.indexOf('!side');
    const extraLines = lines.slice(extraStart, sideStart);
    expect(extraLines.filter(l => l === '3')).toHaveLength(2);
  });
});

describe('getYdkFilename', () => {
  it('replaces spaces with underscores', () =>
    expect(getYdkFilename('My Deck')).toBe('My_Deck.ydk'));
  it('removes special characters', () =>
    expect(getYdkFilename('Deck!')).toBe('Deck_.ydk'));
});
```

- [ ] **Step 6: Run test — debe fallar**

```powershell
npx vitest run src/utils/__tests__/ydkExporter.test.ts
```

Expected: FAIL — `Cannot find module '../ydkExporter'`

- [ ] **Step 7: Implementar src/utils/ydkExporter.ts**

```typescript
import type { Deck } from '../types/ygo';

export function exportToYdk(deck: Deck): string {
  const expand = (zone: typeof deck.main) =>
    zone.flatMap(dc => Array(dc.count).fill(String(dc.card.id)));

  return [
    '#created by YGODEX',
    '#main',
    ...expand(deck.main),
    '#extra',
    ...expand(deck.extra),
    '!side',
    ...expand(deck.side),
  ].join('\n');
}

export function getYdkFilename(deckName: string): string {
  return `${deckName.replace(/[^a-zA-Z0-9]/g, '_')}.ydk`;
}
```

- [ ] **Step 8: Escribir test para priceCalc**

Crear `src/utils/__tests__/priceCalc.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getCardPrice, calcDeckPrice, calcTotalDeckPrice } from '../priceCalc';
import type { YGOCard, DeckCard } from '../../types/ygo';

const makeCard = (tcgPrice: string): YGOCard => ({
  id: 1,
  name: 'Card',
  type: 'Effect Monster',
  frameType: 'effect',
  desc: '',
  race: 'Dragon',
  card_images: [],
  card_prices: [{
    tcgplayer_price: tcgPrice,
    cardmarket_price: '0',
    ebay_price: '0',
    amazon_price: '0',
    coolstuffinc_price: '0',
  }],
});

describe('getCardPrice', () => {
  it('returns parsed tcgplayer price', () =>
    expect(getCardPrice(makeCard('3.50'))).toBe(3.5));
  it('returns 0 for invalid price', () =>
    expect(getCardPrice(makeCard('N/A'))).toBe(0));
  it('returns 0 when card_prices is empty', () => {
    const card = makeCard('5.00');
    card.card_prices = [];
    expect(getCardPrice(card)).toBe(0);
  });
});

describe('calcDeckPrice', () => {
  it('multiplies price by count and sums', () => {
    const zone: DeckCard[] = [
      { card: makeCard('2.00'), count: 3 },
      { card: makeCard('5.00'), count: 1 },
    ];
    expect(calcDeckPrice(zone)).toBe(11);
  });
});

describe('calcTotalDeckPrice', () => {
  it('sums all zones', () => {
    const z = (price: string, count: number): DeckCard[] =>
      [{ card: makeCard(price), count }];
    expect(calcTotalDeckPrice(z('10.00', 1), z('5.00', 2), z('1.00', 3))).toBe(23);
  });
});
```

- [ ] **Step 9: Run test — debe fallar**

```powershell
npx vitest run src/utils/__tests__/priceCalc.test.ts
```

Expected: FAIL — `Cannot find module '../priceCalc'`

- [ ] **Step 10: Implementar src/utils/priceCalc.ts**

```typescript
import type { DeckCard, YGOCard } from '../types/ygo';

export function getCardPrice(card: YGOCard): number {
  const priceStr = card.card_prices?.[0]?.tcgplayer_price ?? '0';
  return parseFloat(priceStr) || 0;
}

export function calcDeckPrice(zone: DeckCard[]): number {
  return zone.reduce((sum, dc) => sum + getCardPrice(dc.card) * dc.count, 0);
}

export function calcTotalDeckPrice(
  main: DeckCard[],
  extra: DeckCard[],
  side: DeckCard[],
): number {
  return calcDeckPrice(main) + calcDeckPrice(extra) + calcDeckPrice(side);
}
```

- [ ] **Step 11: Verificar todos los tests pasan**

```powershell
npx vitest run src/utils/__tests__/
```

Expected: PASS — 19 tests passed, 0 failed.

- [ ] **Step 12: Commit**

```powershell
git add src/utils
git commit -m "feat: add deck validator, YDK exporter, and price calculator with TDD"
```

---

### Task 4: Capa API

**Files:**
- Create: `src/api/cards.ts`
- Create: `src/api/__tests__/cards.test.ts`

- [ ] **Step 1: Escribir test fallido para la API**

Crear `src/api/__tests__/cards.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCards, getCardById } from '../cards';
import type { YGOCard } from '../../types/ygo';

const mockCard: YGOCard = {
  id: 89631139,
  name: 'Blue-Eyes White Dragon',
  type: 'Normal Monster',
  frameType: 'normal',
  desc: 'This legendary dragon...',
  atk: 3000,
  def: 2500,
  level: 8,
  race: 'Dragon',
  attribute: 'LIGHT',
  card_images: [{ id: 89631139, image_url: '', image_url_small: '', image_url_cropped: '' }],
  card_prices: [{ tcgplayer_price: '5.00', cardmarket_price: '', ebay_price: '', amazon_price: '', coolstuffinc_price: '' }],
};

beforeEach(() => {
  vi.spyOn(global, 'fetch');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getCards', () => {
  it('returns cards from API', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(
      JSON.stringify({ data: [mockCard] }),
      { status: 200 }
    ));
    const cards = await getCards({ fname: 'blue-eyes' });
    expect(cards).toHaveLength(1);
    expect(cards[0].name).toBe('Blue-Eyes White Dragon');
  });

  it('returns empty array when API returns error object', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(
      JSON.stringify({ error: 'No card matching your query was found.' }),
      { status: 200 }
    ));
    const cards = await getCards({ fname: 'zzznomatch' });
    expect(cards).toEqual([]);
  });

  it('returns empty array on network failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
    const cards = await getCards({ fname: 'test' });
    expect(cards).toEqual([]);
  });

  it('applies ATK min/max filter client-side', async () => {
    const lowCard = { ...mockCard, id: 1, atk: 500 };
    vi.mocked(fetch).mockResolvedValueOnce(new Response(
      JSON.stringify({ data: [mockCard, lowCard] }),
      { status: 200 }
    ));
    const cards = await getCards({ atkMin: 1000 });
    expect(cards).toHaveLength(1);
    expect(cards[0].atk).toBe(3000);
  });
});

describe('getCardById', () => {
  it('returns single card', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(
      JSON.stringify({ data: [mockCard] }),
      { status: 200 }
    ));
    const card = await getCardById(89631139);
    expect(card?.id).toBe(89631139);
  });

  it('returns null when not found', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(
      JSON.stringify({ error: 'No card found' }),
      { status: 200 }
    ));
    const card = await getCardById(99999999);
    expect(card).toBeNull();
  });
});
```

- [ ] **Step 2: Verificar que el test falla**

```powershell
npx vitest run src/api/__tests__/cards.test.ts
```

Expected: FAIL — `Cannot find module '../cards'`

- [ ] **Step 3: Implementar src/api/cards.ts**

```typescript
import type { CardFilters, YGOCard } from '../types/ygo';

const BASE_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

async function fetchYGO(params: Record<string, string | number>): Promise<YGOCard[]> {
  try {
    const url = new URL(BASE_URL);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    url.searchParams.set('banlist_info', 'yes');
    const res = await fetch(url.toString());
    const json = (await res.json()) as { data?: YGOCard[]; error?: string };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function getCards(filters: CardFilters & { num?: number; offset?: number }): Promise<YGOCard[]> {
  const params: Record<string, string | number> = {};

  if (filters.fname) params['fname'] = filters.fname;
  if (filters.type) params['type'] = filters.type;
  if (filters.attribute) params['attribute'] = filters.attribute;
  if (filters.race) params['race'] = filters.race;
  if (filters.archetype) params['archetype'] = filters.archetype;
  if (filters.level) params['level'] = filters.level;
  if (filters.num !== undefined) params['num'] = filters.num;
  if (filters.offset !== undefined) params['offset'] = filters.offset;

  let cards = await fetchYGO(params);

  if (filters.atkMin !== undefined) cards = cards.filter(c => (c.atk ?? 0) >= filters.atkMin!);
  if (filters.atkMax !== undefined) cards = cards.filter(c => (c.atk ?? 9999) <= filters.atkMax!);
  if (filters.defMin !== undefined) cards = cards.filter(c => (c.def ?? 0) >= filters.defMin!);
  if (filters.defMax !== undefined) cards = cards.filter(c => (c.def ?? 9999) <= filters.defMax!);

  return cards;
}

export async function getCardById(id: number): Promise<YGOCard | null> {
  const cards = await fetchYGO({ id });
  return cards[0] ?? null;
}

export async function getAllCards(num = 20, offset = 0): Promise<YGOCard[]> {
  return fetchYGO({ num, offset });
}
```

- [ ] **Step 4: Verificar que los tests pasan**

```powershell
npx vitest run src/api/__tests__/cards.test.ts
```

Expected: PASS — 6 tests passed.

- [ ] **Step 5: Commit**

```powershell
git add src/api
git commit -m "feat: add YGOPRODeck API layer with tests"
```

---

### Task 5: Stores Zustand

**Files:**
- Create: `src/store/deckStore.ts`
- Create: `src/store/themeStore.ts`
- Create: `src/store/__tests__/deckStore.test.ts`

- [ ] **Step 1: Escribir test para deckStore**

Crear `src/store/__tests__/deckStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useDeckStore } from '../deckStore';
import type { YGOCard } from '../../types/ygo';

const makeCard = (id: number): YGOCard => ({
  id,
  name: `Card ${id}`,
  type: 'Effect Monster',
  frameType: 'effect',
  desc: '',
  race: 'Dragon',
  card_images: [],
  card_prices: [],
});

beforeEach(() => {
  useDeckStore.setState({ decks: [], activeDeckId: null });
});

describe('deckStore', () => {
  it('creates a deck', () => {
    useDeckStore.getState().createDeck('My Deck');
    const { decks } = useDeckStore.getState();
    expect(decks).toHaveLength(1);
    expect(decks[0].name).toBe('My Deck');
    expect(decks[0].main).toEqual([]);
  });

  it('sets active deck', () => {
    useDeckStore.getState().createDeck('Deck A');
    const { decks } = useDeckStore.getState();
    useDeckStore.getState().setActiveDeck(decks[0].id);
    expect(useDeckStore.getState().activeDeckId).toBe(decks[0].id);
  });

  it('adds card to main zone', () => {
    useDeckStore.getState().createDeck('Test');
    const deck = useDeckStore.getState().decks[0];
    useDeckStore.getState().addCard(deck.id, 'main', makeCard(1));
    const updated = useDeckStore.getState().decks[0];
    expect(updated.main).toHaveLength(1);
    expect(updated.main[0].count).toBe(1);
  });

  it('increments count when same card added again', () => {
    useDeckStore.getState().createDeck('Test');
    const deck = useDeckStore.getState().decks[0];
    useDeckStore.getState().addCard(deck.id, 'main', makeCard(1));
    useDeckStore.getState().addCard(deck.id, 'main', makeCard(1));
    const updated = useDeckStore.getState().decks[0];
    expect(updated.main[0].count).toBe(2);
  });

  it('removes card from zone', () => {
    useDeckStore.getState().createDeck('Test');
    const deck = useDeckStore.getState().decks[0];
    useDeckStore.getState().addCard(deck.id, 'main', makeCard(1));
    useDeckStore.getState().addCard(deck.id, 'main', makeCard(1));
    useDeckStore.getState().removeCard(deck.id, 'main', 1);
    const updated = useDeckStore.getState().decks[0];
    expect(updated.main[0].count).toBe(1);
  });

  it('removes card entry when count reaches 0', () => {
    useDeckStore.getState().createDeck('Test');
    const deck = useDeckStore.getState().decks[0];
    useDeckStore.getState().addCard(deck.id, 'main', makeCard(1));
    useDeckStore.getState().removeCard(deck.id, 'main', 1);
    const updated = useDeckStore.getState().decks[0];
    expect(updated.main).toHaveLength(0);
  });

  it('deletes a deck', () => {
    useDeckStore.getState().createDeck('Delete me');
    const { decks } = useDeckStore.getState();
    useDeckStore.getState().deleteDeck(decks[0].id);
    expect(useDeckStore.getState().decks).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Verificar que el test falla**

```powershell
npx vitest run src/store/__tests__/deckStore.test.ts
```

Expected: FAIL — `Cannot find module '../deckStore'`

- [ ] **Step 3: Implementar src/store/deckStore.ts**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'crypto';
import type { Deck, DeckCard, DeckZoneType, YGOCard } from '../types/ygo';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface DeckStore {
  decks: Deck[];
  activeDeckId: string | null;
  createDeck: (name: string) => void;
  deleteDeck: (id: string) => void;
  renameDeck: (id: string, name: string) => void;
  setActiveDeck: (id: string | null) => void;
  addCard: (deckId: string, zone: DeckZoneType, card: YGOCard) => void;
  removeCard: (deckId: string, zone: DeckZoneType, cardId: number) => void;
}

export const useDeckStore = create<DeckStore>()(
  persist(
    (set) => ({
      decks: [],
      activeDeckId: null,

      createDeck: (name) =>
        set((s) => {
          const deck: Deck = {
            id: generateId(),
            name,
            main: [],
            extra: [],
            side: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          return { decks: [...s.decks, deck], activeDeckId: deck.id };
        }),

      deleteDeck: (id) =>
        set((s) => ({
          decks: s.decks.filter((d) => d.id !== id),
          activeDeckId: s.activeDeckId === id ? null : s.activeDeckId,
        })),

      renameDeck: (id, name) =>
        set((s) => ({
          decks: s.decks.map((d) =>
            d.id === id ? { ...d, name, updatedAt: Date.now() } : d
          ),
        })),

      setActiveDeck: (id) => set({ activeDeckId: id }),

      addCard: (deckId, zone, card) =>
        set((s) => ({
          decks: s.decks.map((d) => {
            if (d.id !== deckId) return d;
            const existing = d[zone].find((dc) => dc.card.id === card.id);
            const updatedZone: DeckCard[] = existing
              ? d[zone].map((dc) =>
                  dc.card.id === card.id ? { ...dc, count: dc.count + 1 } : dc
                )
              : [...d[zone], { card, count: 1 }];
            return { ...d, [zone]: updatedZone, updatedAt: Date.now() };
          }),
        })),

      removeCard: (deckId, zone, cardId) =>
        set((s) => ({
          decks: s.decks.map((d) => {
            if (d.id !== deckId) return d;
            const updatedZone = d[zone]
              .map((dc) =>
                dc.card.id === cardId ? { ...dc, count: dc.count - 1 } : dc
              )
              .filter((dc) => dc.count > 0);
            return { ...d, [zone]: updatedZone, updatedAt: Date.now() };
          }),
        })),
    }),
    {
      name: 'ygodex-decks',
      partialize: (s) => ({ decks: s.decks, activeDeckId: s.activeDeckId }),
    }
  )
);
```

- [ ] **Step 4: Crear src/store/themeStore.ts**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  applyTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.classList.toggle('dark', next === 'dark');
          return { theme: next };
        }),
      applyTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },
    }),
    { name: 'ygodex-theme' }
  )
);
```

- [ ] **Step 5: Verificar que los tests pasan**

```powershell
npx vitest run src/store/__tests__/deckStore.test.ts
```

Expected: PASS — 7 tests passed.

- [ ] **Step 6: Commit**

```powershell
git add src/store
git commit -m "feat: add Zustand deck and theme stores with persistence"
```

---

### Task 6: Custom Hooks

**Files:**
- Create: `src/hooks/useCardSearch.ts`
- Create: `src/hooks/useCardDetail.ts`
- Create: `src/hooks/useDeckBuilder.ts`

*(Hooks wrapping TanStack Query — no tests separados; la integración se prueba en las páginas)*

- [ ] **Step 1: Crear src/hooks/useCardSearch.ts**

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { getCards } from '../api/cards';
import type { CardFilters } from '../types/ygo';

const PAGE_SIZE = 20;

export function useCardSearch(filters: CardFilters) {
  return useInfiniteQuery({
    queryKey: ['cards', filters],
    queryFn: ({ pageParam = 0 }) =>
      getCards({ ...filters, num: PAGE_SIZE, offset: pageParam as number }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
    initialPageParam: 0,
    staleTime: Infinity,
  });
}
```

- [ ] **Step 2: Crear src/hooks/useCardDetail.ts**

```typescript
import { useQuery } from '@tanstack/react-query';
import { getCardById } from '../api/cards';

export function useCardDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['card', id],
    queryFn: () => getCardById(Number(id)),
    staleTime: Infinity,
    enabled: !!id && !isNaN(Number(id)),
  });
}
```

- [ ] **Step 3: Crear src/hooks/useDeckBuilder.ts**

```typescript
import { useDeckStore } from '../store/deckStore';
import { canAddCard, isExtraDeckCard } from '../utils/deckValidator';
import type { YGOCard, DeckZoneType, BanFormat } from '../types/ygo';

export function useDeckBuilder(deckId: string) {
  const { decks, addCard, removeCard } = useDeckStore();
  const deck = decks.find((d) => d.id === deckId);

  function getTargetZone(card: YGOCard): DeckZoneType {
    return isExtraDeckCard(card) ? 'extra' : 'main';
  }

  function tryAddCard(card: YGOCard, zone?: DeckZoneType, format: BanFormat = 'tcg'): boolean {
    if (!deck) return false;
    const targetZone = zone ?? getTargetZone(card);
    const zoneCards = deck[targetZone];
    if (!canAddCard(card, zoneCards, format)) return false;
    addCard(deckId, targetZone, card);
    return true;
  }

  function tryRemoveCard(cardId: number, zone: DeckZoneType): void {
    removeCard(deckId, zone, cardId);
  }

  return { deck, tryAddCard, tryRemoveCard, getTargetZone };
}
```

- [ ] **Step 4: Commit**

```powershell
git add src/hooks
git commit -m "feat: add custom hooks for card search, detail, and deck building"
```

---

### Task 7: Router + Layout

**Files:**
- Create: `src/router.tsx`
- Modify: `src/main.tsx`
- Create: `src/components/layout/ThemeToggle.tsx`
- Create: `src/components/layout/ChipDeck.tsx`
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Layout.tsx`

- [ ] **Step 1: Crear páginas placeholder (para que el router compile)**

```powershell
mkdir -p src/pages
```

Crear `src/pages/Home.tsx`:
```tsx
export default function Home() { return <div>Home</div>; }
```

Crear `src/pages/Cards.tsx`:
```tsx
export default function Cards() { return <div>Cards</div>; }
```

Crear `src/pages/CardDetail.tsx`:
```tsx
export default function CardDetail() { return <div>CardDetail</div>; }
```

Crear `src/pages/Decks.tsx`:
```tsx
export default function Decks() { return <div>Decks</div>; }
```

Crear `src/pages/DeckBuilder.tsx`:
```tsx
export default function DeckBuilder() { return <div>DeckBuilder</div>; }
```

- [ ] **Step 2: Crear src/router.tsx**

```tsx
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Cards from './pages/Cards';
import CardDetail from './pages/CardDetail';
import Decks from './pages/Decks';
import DeckBuilder from './pages/DeckBuilder';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'cards', element: <Cards /> },
      { path: 'cards/:id', element: <CardDetail /> },
      { path: 'decks', element: <Decks /> },
      { path: 'decks/:id', element: <DeckBuilder /> },
    ],
  },
]);
```

- [ ] **Step 3: Crear src/components/layout/ThemeToggle.tsx**

```tsx
import { useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';

export default function ThemeToggle() {
  const { theme, toggleTheme, applyTheme } = useThemeStore();

  useEffect(() => {
    applyTheme(theme);
  }, []);

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
      className="p-2 rounded-lg cursor-pointer text-text-main hover:bg-surface2 transition-colors duration-200"
    >
      {theme === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Step 4: Crear src/components/layout/ChipDeck.tsx**

```tsx
import { Link } from 'react-router-dom';
import { useDeckStore } from '../../store/deckStore';

export default function ChipDeck() {
  const { decks, activeDeckId } = useDeckStore();
  const activeDeck = decks.find((d) => d.id === activeDeckId);

  if (!activeDeck) return null;

  const mainCount = activeDeck.main.reduce((s, dc) => s + dc.count, 0);

  return (
    <Link
      to={`/decks/${activeDeckId}`}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-surface hover:bg-surface2 transition-colors duration-200 cursor-pointer"
    >
      <span className="text-xs font-body text-muted">Mazo</span>
      <span className="font-display text-sm text-primary">
        {mainCount}
        <span className="text-muted">/40</span>
      </span>
    </Link>
  );
}
```

- [ ] **Step 5: Crear src/components/layout/Navbar.tsx**

```tsx
import { Link, NavLink } from 'react-router-dom';
import ChipDeck from './ChipDeck';
import ThemeToggle from './ThemeToggle';

const LOGO_URL = 'https://images.ygoprodeck.com/images/cards_cropped/89631139.jpg';

const navLinks = [
  { to: '/cards', label: 'Carta-Dex' },
  { to: '/decks', label: 'Mazos' },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-between bg-bg/90 backdrop-blur-sm border-b border-primary/10">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        <img
          src={LOGO_URL}
          alt="Blue-Eyes White Dragon"
          className="w-8 h-11 object-cover rounded-sm glow-primary"
          loading="eager"
        />
        <div className="flex flex-col leading-none">
          <span className="font-display text-xl tracking-widest brand-gradient">YGODEX</span>
          <span className="text-[10px] font-body text-muted tracking-widest">CARD DATABASE</span>
        </div>
      </Link>

      {/* Nav links */}
      <div className="hidden sm:flex items-center gap-6">
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `font-body text-sm transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-text-secondary hover:text-text-main'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <ChipDeck />
        <ThemeToggle />
      </div>
    </nav>
  );
}
```

- [ ] **Step 6: Crear src/components/layout/Layout.tsx**

```tsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg dark:bg-bg text-text-main font-body">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 7: Actualizar src/main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, retry: 1 },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
```

- [ ] **Step 8: Verificar que el build compila**

```powershell
npm run build
```

Expected: Build exitoso sin errores de TypeScript.

- [ ] **Step 9: Commit**

```powershell
git add src/router.tsx src/main.tsx src/components/layout src/pages
git commit -m "feat: add router, layout, navbar, chip deck, and theme toggle"
```

---

### Task 8: Badge Components

**Files:**
- Create: `src/components/cards/TypeBadge.tsx`
- Create: `src/components/cards/BanBadge.tsx`

- [ ] **Step 1: Crear src/components/cards/TypeBadge.tsx**

```tsx
import { getTypeBg, getTypeColor } from '../../constants/typeColors';

interface Props {
  type: string;
  small?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  'Effect Monster': 'Monstruo',
  'Normal Monster': 'Normal',
  'Ritual Monster': 'Ritual',
  'Fusion Monster': 'Fusión',
  'Synchro Monster': 'Sincronía',
  'XYZ Monster': 'XYZ',
  'Link Monster': 'Link',
  'Pendulum Effect Monster': 'Péndulo',
  'Spell Card': 'Magia',
  'Trap Card': 'Trampa',
};

export default function TypeBadge({ type, small = false }: Props) {
  const bg = getTypeBg(type);
  const color = getTypeColor(type);
  const label = TYPE_LABELS[type] ?? type;

  return (
    <span
      className={`inline-flex items-center rounded font-body font-medium ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Crear src/components/cards/BanBadge.tsx**

```tsx
import type { BanlistInfo, BanFormat } from '../../types/ygo';

interface Props {
  banlistInfo?: BanlistInfo;
  format?: BanFormat;
}

const BAN_CONFIG = {
  Banned:       { icon: '🚫', label: 'Prohibida', color: '#ef4444' },
  Limited:      { icon: '⚠',  label: 'Limitada',  color: '#f59e0b' },
  'Semi-Limited':{ icon: '½', label: 'Semi-Lim.',  color: '#3b82f6' },
} as const;

export default function BanBadge({ banlistInfo, format = 'tcg' }: Props) {
  if (!banlistInfo) return null;
  const status =
    format === 'tcg' ? banlistInfo.ban_tcg :
    format === 'ocg' ? banlistInfo.ban_ocg :
    banlistInfo.ban_goat;

  if (!status) return null;
  const cfg = BAN_CONFIG[status];

  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-body font-semibold px-1.5 py-0.5 rounded border"
      style={{ color: cfg.color, borderColor: `${cfg.color}55` }}
    >
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </span>
  );
}
```

- [ ] **Step 3: Verificar que el build compila**

```powershell
npm run build
```

Expected: Build exitoso.

- [ ] **Step 4: Commit**

```powershell
git add src/components/cards/TypeBadge.tsx src/components/cards/BanBadge.tsx
git commit -m "feat: add TypeBadge and BanBadge components"
```

---

### Task 9: CardMini + CardGrid

**Files:**
- Create: `src/components/cards/CardMini.tsx`
- Create: `src/components/cards/CardGrid.tsx`

- [ ] **Step 1: Crear src/components/cards/CardMini.tsx**

```tsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TypeBadge from './TypeBadge';
import BanBadge from './BanBadge';
import type { YGOCard } from '../../types/ygo';

interface Props {
  card: YGOCard;
  onAdd?: (card: YGOCard) => void;
}

export default function CardMini({ card, onAdd }: Props) {
  const image = card.card_images[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col rounded-lg overflow-hidden border border-primary/15 bg-surface hover:border-primary/40 transition-colors duration-200 cursor-pointer"
    >
      <Link to={`/cards/${card.id}`} className="block">
        <div className="relative aspect-[421/614] overflow-hidden bg-surface2">
          {image ? (
            <img
              src={image.image_url_cropped || image.image_url_small}
              alt={card.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-xs">Sin imagen</div>
          )}
          {/* Ban overlay */}
          {card.banlist_info?.ban_tcg && (
            <div className="absolute top-1 right-1">
              <BanBadge banlistInfo={card.banlist_info} />
            </div>
          )}
        </div>
        <div className="p-2 space-y-1">
          <p className="text-[11px] font-body text-text-main leading-tight line-clamp-2">{card.name}</p>
          <TypeBadge type={card.type} small />
        </div>
      </Link>
      {onAdd && (
        <button
          onClick={(e) => { e.preventDefault(); onAdd(card); }}
          aria-label={`Añadir ${card.name} al mazo`}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center transition-opacity duration-200 cursor-pointer hover:bg-primary2"
        >
          +
        </button>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Crear src/components/cards/CardGrid.tsx**

```tsx
import CardMini from './CardMini';
import type { YGOCard } from '../../types/ygo';

interface Props {
  cards: YGOCard[];
  onAdd?: (card: YGOCard) => void;
  loading?: boolean;
}

const SKELETON_COUNT = 20;

function CardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-primary/10 bg-surface animate-pulse">
      <div className="aspect-[421/614] bg-surface2" />
      <div className="p-2 space-y-1">
        <div className="h-3 bg-surface2 rounded w-3/4" />
        <div className="h-4 bg-surface2 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function CardGrid({ cards, onAdd, loading = false }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (!loading && cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="font-body text-sm">No se encontraron cartas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <CardMini key={card.id} card={card} onAdd={onAdd} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verificar build**

```powershell
npm run build
```

Expected: Build exitoso.

- [ ] **Step 4: Commit**

```powershell
git add src/components/cards/CardMini.tsx src/components/cards/CardGrid.tsx
git commit -m "feat: add CardMini and CardGrid components"
```

---

### Task 10: CardDetail Component

**Files:**
- Create: `src/components/cards/CardDetail.tsx`

- [ ] **Step 1: Crear src/components/cards/CardDetail.tsx**

```tsx
import { motion } from 'framer-motion';
import { useDeckStore } from '../../store/deckStore';
import { canAddCard, isExtraDeckCard } from '../../utils/deckValidator';
import { getAttributeColor } from '../../constants/typeColors';
import TypeBadge from './TypeBadge';
import BanBadge from './BanBadge';
import type { YGOCard } from '../../types/ygo';

interface Props {
  card: YGOCard;
}

export default function CardDetail({ card }: Props) {
  const { decks, activeDeckId, addCard } = useDeckStore();
  const activeDeck = decks.find((d) => d.id === activeDeckId);
  const attrColor = getAttributeColor(card.attribute);
  const image = card.card_images[0];
  const price = parseFloat(card.card_prices?.[0]?.tcgplayer_price ?? '0') || 0;
  const zone = isExtraDeckCard(card) ? 'extra' : 'main';

  const canAdd = activeDeck ? canAddCard(card, activeDeck[zone]) : false;

  function handleAdd() {
    if (activeDeckId && canAdd) addCard(activeDeckId, zone, card);
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Reactive gradient header */}
      <div
        className="absolute top-0 left-0 w-80 h-80 opacity-20 pointer-events-none rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${attrColor}, transparent 70%)` }}
      />

      <div className="relative max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-[300px_1fr] gap-8">
        {/* Card image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          {image && (
            <img
              src={image.image_url}
              alt={card.name}
              className="w-full max-w-xs rounded-lg shadow-2xl glow-primary"
              loading="eager"
            />
          )}
          {price > 0 && (
            <p className="font-body text-sm text-muted">
              TCGPlayer: <span className="text-text-main font-semibold">${price.toFixed(2)} USD</span>
            </p>
          )}
          {activeDeckId && (
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className="w-full py-2.5 rounded-lg font-display text-sm tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: canAdd ? attrColor : undefined,
                border: canAdd ? 'none' : `1px solid ${attrColor}`,
                color: canAdd ? '#fff' : attrColor,
              }}
            >
              {canAdd ? 'Agregar al mazo' : 'Límite alcanzado'}
            </button>
          )}
        </motion.div>

        {/* Card info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-5"
        >
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-text-main mb-2">{card.name}</h1>
            <div className="flex flex-wrap gap-2 items-center">
              <TypeBadge type={card.type} />
              <BanBadge banlistInfo={card.banlist_info} />
              {card.attribute && (
                <span className="text-xs font-body px-2 py-1 rounded" style={{ color: attrColor, border: `1px solid ${attrColor}44` }}>
                  {card.attribute}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {card.atk !== undefined && (
              <div className="p-3 rounded-lg bg-surface border border-primary/10">
                <p className="text-[10px] font-body text-muted mb-1">ATK</p>
                <p className="font-display text-xl" style={{ color: attrColor }}>{card.atk}</p>
              </div>
            )}
            {card.def !== undefined && (
              <div className="p-3 rounded-lg bg-surface border border-primary/10">
                <p className="text-[10px] font-body text-muted mb-1">DEF</p>
                <p className="font-display text-xl" style={{ color: attrColor }}>{card.def}</p>
              </div>
            )}
            {(card.level || card.rank) && (
              <div className="p-3 rounded-lg bg-surface border border-primary/10">
                <p className="text-[10px] font-body text-muted mb-1">{card.rank ? 'RANGO' : 'NIVEL'}</p>
                <p className="font-display text-xl text-primary">{card.level ?? card.rank}</p>
              </div>
            )}
            {card.linkval && (
              <div className="p-3 rounded-lg bg-surface border border-primary/10">
                <p className="text-[10px] font-body text-muted mb-1">LINK</p>
                <p className="font-display text-xl text-primary2">{card.linkval}</p>
              </div>
            )}
          </div>

          {/* Meta */}
          {card.race && (
            <p className="text-sm font-body text-text-secondary">
              <span className="text-muted">Subtipo: </span>{card.race}
            </p>
          )}
          {card.archetype && (
            <p className="text-sm font-body text-text-secondary">
              <span className="text-muted">Arquetipo: </span>{card.archetype}
            </p>
          )}

          {/* Description */}
          <div className="p-4 rounded-lg bg-surface border border-primary/10">
            <p className="text-sm font-body text-text-secondary leading-relaxed whitespace-pre-wrap">{card.desc}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

```powershell
npm run build
```

Expected: Build exitoso.

- [ ] **Step 3: Commit**

```powershell
git add src/components/cards/CardDetail.tsx
git commit -m "feat: add CardDetail component with reactive attribute gradient"
```

---

### Task 11: Deck Components

**Files:**
- Create: `src/components/deck/DeckZone.tsx`
- Create: `src/components/deck/DeckMiniGrid.tsx`
- Create: `src/components/deck/LevelCurve.tsx`
- Create: `src/components/deck/DeckStats.tsx`

- [ ] **Step 1: Crear src/components/deck/DeckMiniGrid.tsx**

```tsx
import type { DeckCard, DeckZoneType } from '../../types/ygo';

interface Props {
  cards: DeckCard[];
  zone: DeckZoneType;
  onRemove?: (cardId: number, zone: DeckZoneType) => void;
}

export default function DeckMiniGrid({ cards, zone, onRemove }: Props) {
  if (cards.length === 0) {
    return <p className="text-xs font-body text-muted py-4 text-center">Sin cartas</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2">
      {cards.map(({ card, count }) =>
        Array.from({ length: count }).map((_, i) => (
          <button
            key={`${card.id}-${i}`}
            onClick={() => onRemove?.(card.id, zone)}
            title={card.name}
            aria-label={`Eliminar ${card.name} del mazo`}
            className="relative group w-10 h-14 rounded overflow-hidden border border-primary/20 hover:border-red-400/60 transition-colors duration-200 cursor-pointer flex-shrink-0"
          >
            {card.card_images[0] ? (
              <img
                src={card.card_images[0].image_url_small}
                alt={card.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-surface2 flex items-center justify-center text-[8px] text-muted text-center px-0.5">
                {card.name.slice(0, 8)}
              </div>
            )}
            <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/30 flex items-center justify-center transition-colors duration-200">
              <span className="opacity-0 group-hover:opacity-100 text-white text-base">×</span>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
```

- [ ] **Step 2: Crear src/components/deck/DeckZone.tsx**

```tsx
import DeckMiniGrid from './DeckMiniGrid';
import type { DeckCard, DeckZoneType } from '../../types/ygo';

interface Props {
  zone: DeckZoneType;
  cards: DeckCard[];
  max: number;
  onRemove?: (cardId: number, zone: DeckZoneType) => void;
}

const ZONE_LABELS: Record<DeckZoneType, string> = {
  main: 'Main Deck',
  extra: 'Extra Deck',
  side: 'Side Deck',
};

const ZONE_COLORS: Record<DeckZoneType, string> = {
  main: '#8060ff',
  extra: '#c084fc',
  side: '#60a0ff',
};

export default function DeckZone({ zone, cards, max, onRemove }: Props) {
  const total = cards.reduce((s, dc) => s + dc.count, 0);
  const percent = Math.min((total / max) * 100, 100);
  const color = ZONE_COLORS[zone];

  return (
    <div className="rounded-lg border border-primary/15 bg-surface overflow-hidden">
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-sm" style={{ color }}>{ZONE_LABELS[zone]}</span>
          <span className="font-body text-xs text-muted">{total} / {max}</span>
        </div>
        <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
      </div>
      <DeckMiniGrid cards={cards} zone={zone} onRemove={onRemove} />
    </div>
  );
}
```

- [ ] **Step 3: Crear src/components/deck/LevelCurve.tsx**

```tsx
import type { DeckCard } from '../../types/ygo';

interface Props {
  mainDeck: DeckCard[];
}

export default function LevelCurve({ mainDeck }: Props) {
  const counts: Record<number, number> = {};
  mainDeck.forEach(({ card, count }) => {
    const lv = card.level ?? card.rank;
    if (lv) counts[lv] = (counts[lv] ?? 0) + count;
  });

  const levels = Object.keys(counts).map(Number).sort((a, b) => a - b);
  if (levels.length === 0) return null;
  const maxCount = Math.max(...Object.values(counts));

  return (
    <div>
      <p className="text-xs font-body text-muted mb-2">Curva de Niveles</p>
      <div className="flex items-end gap-1 h-16">
        {levels.map((lv) => {
          const h = Math.round(((counts[lv] ?? 0) / maxCount) * 100);
          return (
            <div key={lv} className="flex flex-col items-center gap-0.5 flex-1">
              <span className="text-[9px] font-body text-muted">{counts[lv]}</span>
              <div
                className="w-full rounded-t-sm bg-primary transition-all duration-300"
                style={{ height: `${h}%` }}
              />
              <span className="text-[9px] font-body text-muted">{lv}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Crear src/components/deck/DeckStats.tsx**

```tsx
import { useState } from 'react';
import LevelCurve from './LevelCurve';
import { calcTotalDeckPrice } from '../../utils/priceCalc';
import type { DeckCard } from '../../types/ygo';

interface Props {
  main: DeckCard[];
  extra: DeckCard[];
  side: DeckCard[];
}

export default function DeckStats({ main, extra, side }: Props) {
  const [open, setOpen] = useState(false);
  const totalPrice = calcTotalDeckPrice(main, extra, side);

  const mainTotal = main.reduce((s, dc) => s + dc.count, 0);
  const monsters = main.filter(dc => dc.card.type.includes('Monster')).reduce((s, dc) => s + dc.count, 0);
  const spells = main.filter(dc => dc.card.type === 'Spell Card').reduce((s, dc) => s + dc.count, 0);
  const traps = main.filter(dc => dc.card.type === 'Trap Card').reduce((s, dc) => s + dc.count, 0);

  return (
    <div className="rounded-lg border border-primary/15 bg-surface overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-surface2 transition-colors duration-200"
      >
        <span className="font-display text-sm text-primary2">Análisis</span>
        <span className="text-muted text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Distribution */}
          {mainTotal > 0 && (
            <div>
              <p className="text-xs font-body text-muted mb-2">Distribución</p>
              <div className="h-3 rounded-full overflow-hidden flex">
                <div className="bg-orange-500 transition-all" style={{ width: `${(monsters / mainTotal) * 100}%` }} title={`Monstruos: ${monsters}`} />
                <div className="bg-green-500 transition-all" style={{ width: `${(spells / mainTotal) * 100}%` }} title={`Magias: ${spells}`} />
                <div className="bg-pink-500 transition-all" style={{ width: `${(traps / mainTotal) * 100}%` }} title={`Trampas: ${traps}`} />
              </div>
              <div className="flex gap-4 mt-1.5">
                <span className="text-[10px] font-body text-orange-400">Monstruos {monsters}</span>
                <span className="text-[10px] font-body text-green-400">Magias {spells}</span>
                <span className="text-[10px] font-body text-pink-400">Trampas {traps}</span>
              </div>
            </div>
          )}

          <LevelCurve mainDeck={main} />

          <div>
            <p className="text-xs font-body text-muted mb-1">Precio Total</p>
            <p className="font-display text-lg text-primary">${totalPrice.toFixed(2)} <span className="text-xs text-muted">USD</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Verificar build**

```powershell
npm run build
```

Expected: Build exitoso.

- [ ] **Step 6: Commit**

```powershell
git add src/components/deck
git commit -m "feat: add deck components (DeckZone, DeckMiniGrid, LevelCurve, DeckStats)"
```

---

### Task 12: Home Page

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Implementar src/pages/Home.tsx**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LOGO_URL = 'https://images.ygoprodeck.com/images/cards/89631139.jpg';

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/cards?fname=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8060ff, transparent 70%)' }} />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 text-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          <img
            src={LOGO_URL}
            alt="Blue-Eyes White Dragon"
            className="w-24 h-32 object-cover rounded-lg glow-primary"
          />
          <h1 className="font-display text-5xl md:text-7xl tracking-widest brand-gradient">YGODEX</h1>
          <p className="font-body text-base text-text-secondary max-w-md">
            Base de datos completa de cartas Yu-Gi-Oh + Deck Builder integrado
          </p>
        </motion.div>

        {/* Search */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSearch}
          className="w-full max-w-lg flex gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar carta... (ej: Blue-Eyes, Dark Magician)"
            className="flex-1 px-4 py-3 rounded-lg bg-surface border border-primary/20 text-text-main font-body text-sm placeholder-muted focus:outline-none focus:border-primary/60 transition-colors duration-200"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-primary hover:bg-primary2 text-white font-display text-sm tracking-wider transition-colors duration-200 cursor-pointer"
          >
            Buscar
          </button>
        </motion.form>

        {/* Quick access */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-4"
        >
          <Link
            to="/cards"
            className="px-6 py-2.5 rounded-lg border border-primary/30 hover:border-primary/60 font-body text-sm text-text-secondary hover:text-text-main transition-colors duration-200"
          >
            Ver Carta-Dex
          </Link>
          <Link
            to="/decks"
            className="px-6 py-2.5 rounded-lg border border-primary2/30 hover:border-primary2/60 font-body text-sm text-text-secondary hover:text-text-main transition-colors duration-200"
          >
            Mis Mazos
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

```powershell
npm run build
```

Expected: Build exitoso.

- [ ] **Step 3: Commit**

```powershell
git add src/pages/Home.tsx
git commit -m "feat: implement Home page with hero search"
```

---

### Task 13: Cards Page (Carta-Dex)

**Files:**
- Modify: `src/pages/Cards.tsx`

- [ ] **Step 1: Implementar src/pages/Cards.tsx**

```tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CardGrid from '../components/cards/CardGrid';
import { useCardSearch } from '../hooks/useCardSearch';
import { useDeckStore } from '../store/deckStore';
import { useDeckBuilder } from '../hooks/useDeckBuilder';
import { BASIC_FILTER_CATEGORIES, ATTRIBUTES, RACES, LEVELS, FORMATS } from '../constants/cardTypes';
import type { CardFilters, YGOCard } from '../types/ygo';

export default function Cards() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeDeckId } = useDeckStore();
  const deckBuilder = useDeckBuilder(activeDeckId ?? '');

  const [filters, setFilters] = useState<CardFilters>({
    fname: searchParams.get('fname') ?? '',
    type: '',
    attribute: '',
    race: '',
    archetype: '',
    level: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useCardSearch(filters);

  const cards = data?.pages.flat() ?? [];

  function setFilter(key: keyof CardFilters, value: string | number | undefined) {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'fname') {
      setSearchParams(value ? { fname: String(value) } : {});
    }
  }

  function handleAdd(card: YGOCard) {
    if (!activeDeckId) return;
    const added = deckBuilder.tryAddCard(card);
    if (added) {
      setAddedId(card.id);
      setTimeout(() => setAddedId(null), 1200);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl brand-gradient mb-6">Carta-Dex</h1>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          value={filters.fname ?? ''}
          onChange={(e) => setFilter('fname', e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full px-4 py-3 rounded-lg bg-surface border border-primary/20 text-text-main font-body text-sm placeholder-muted focus:outline-none focus:border-primary/60 transition-colors duration-200"
        />
      </div>

      {/* Basic filters — tipo */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setFilter('type', '')}
          className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors duration-200 cursor-pointer border ${!filters.type ? 'border-primary bg-primary/20 text-text-main' : 'border-primary/20 text-muted hover:text-text-main'}`}
        >
          Todos
        </button>
        {BASIC_FILTER_CATEGORIES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter('type', filters.type === value ? '' : value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors duration-200 cursor-pointer border ${filters.type === value ? 'border-primary bg-primary/20 text-text-main' : 'border-primary/20 text-muted hover:text-text-main'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Advanced filters toggle */}
      <button
        onClick={() => setShowAdvanced(o => !o)}
        className="text-xs font-body text-muted hover:text-primary2 transition-colors duration-200 mb-4 cursor-pointer"
      >
        {showAdvanced ? '▲ Ocultar filtros avanzados' : '▼ + Filtros avanzados'}
      </button>

      {/* Advanced filters panel */}
      {showAdvanced && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 rounded-lg bg-surface border border-primary/10">
          {/* Attribute */}
          <div>
            <label className="text-[10px] font-body text-muted block mb-1">Atributo</label>
            <select
              value={filters.attribute ?? ''}
              onChange={(e) => setFilter('attribute', e.target.value)}
              className="w-full bg-surface2 border border-primary/15 rounded px-2 py-1.5 text-xs font-body text-text-main focus:outline-none cursor-pointer"
            >
              <option value="">Todos</option>
              {ATTRIBUTES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Race */}
          <div>
            <label className="text-[10px] font-body text-muted block mb-1">Raza</label>
            <select
              value={filters.race ?? ''}
              onChange={(e) => setFilter('race', e.target.value)}
              className="w-full bg-surface2 border border-primary/15 rounded px-2 py-1.5 text-xs font-body text-text-main focus:outline-none cursor-pointer"
            >
              <option value="">Todas</option>
              {RACES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="text-[10px] font-body text-muted block mb-1">Nivel/Rango</label>
            <select
              value={filters.level ?? ''}
              onChange={(e) => setFilter('level', e.target.value)}
              className="w-full bg-surface2 border border-primary/15 rounded px-2 py-1.5 text-xs font-body text-text-main focus:outline-none cursor-pointer"
            >
              <option value="">Todos</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Archetype */}
          <div>
            <label className="text-[10px] font-body text-muted block mb-1">Arquetipo</label>
            <input
              type="text"
              value={filters.archetype ?? ''}
              onChange={(e) => setFilter('archetype', e.target.value)}
              placeholder="ej: Dragon Ruler"
              className="w-full bg-surface2 border border-primary/15 rounded px-2 py-1.5 text-xs font-body text-text-main placeholder-muted focus:outline-none"
            />
          </div>

          {/* ATK min/max */}
          <div>
            <label className="text-[10px] font-body text-muted block mb-1">ATK mín</label>
            <input
              type="number"
              value={filters.atkMin ?? ''}
              onChange={(e) => setFilter('atkMin', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="0"
              className="w-full bg-surface2 border border-primary/15 rounded px-2 py-1.5 text-xs font-body text-text-main placeholder-muted focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-body text-muted block mb-1">ATK máx</label>
            <input
              type="number"
              value={filters.atkMax ?? ''}
              onChange={(e) => setFilter('atkMax', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="5000"
              className="w-full bg-surface2 border border-primary/15 rounded px-2 py-1.5 text-xs font-body text-text-main placeholder-muted focus:outline-none"
            />
          </div>

          {/* Format */}
          <div>
            <label className="text-[10px] font-body text-muted block mb-1">Formato</label>
            <select
              value={filters.format ?? ''}
              onChange={(e) => setFilter('format', e.target.value as any || undefined)}
              className="w-full bg-surface2 border border-primary/15 rounded px-2 py-1.5 text-xs font-body text-text-main focus:outline-none cursor-pointer"
            >
              <option value="">Todos</option>
              {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ fname: '' })}
              className="w-full px-2 py-1.5 text-xs font-body text-muted border border-primary/15 rounded hover:text-text-main hover:border-primary/30 transition-colors duration-200 cursor-pointer"
            >
              Resetear
            </button>
          </div>
        </div>
      )}

      {/* Added feedback */}
      {addedId && (
        <div className="fixed bottom-6 right-6 bg-primary text-white text-xs font-body px-4 py-2 rounded-full shadow-lg z-50 animate-pulse">
          ✓ Carta agregada al mazo
        </div>
      )}

      {/* Grid */}
      <CardGrid
        cards={cards}
        loading={isLoading}
        onAdd={activeDeckId ? handleAdd : undefined}
      />

      {/* Load more */}
      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-8 py-2.5 rounded-lg border border-primary/30 hover:border-primary/60 font-body text-sm text-text-secondary hover:text-text-main transition-colors duration-200 cursor-pointer disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

```powershell
npm run build
```

Expected: Build exitoso.

- [ ] **Step 3: Commit**

```powershell
git add src/pages/Cards.tsx
git commit -m "feat: implement Cards page with multi-filter and infinite pagination"
```

---

### Task 14: CardDetail Page

**Files:**
- Modify: `src/pages/CardDetail.tsx`

- [ ] **Step 1: Implementar src/pages/CardDetail.tsx**

```tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useCardDetail } from '../hooks/useCardDetail';
import CardDetailComponent from '../components/cards/CardDetail';

export default function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: card, isLoading, isError } = useCardDetail(id);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-[300px_1fr] gap-8 animate-pulse">
        <div className="aspect-[421/614] rounded-lg bg-surface max-w-xs" />
        <div className="space-y-4">
          <div className="h-8 bg-surface rounded w-2/3" />
          <div className="h-4 bg-surface rounded w-1/3" />
          <div className="h-32 bg-surface rounded" />
        </div>
      </div>
    );
  }

  if (isError || !card) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted">
        <p className="font-body text-sm">Carta no encontrada</p>
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-body text-primary hover:underline cursor-pointer"
        >
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-body text-muted hover:text-primary transition-colors duration-200 cursor-pointer"
        >
          ← Volver
        </button>
      </div>
      <CardDetailComponent card={card} />
    </>
  );
}
```

- [ ] **Step 2: Verificar build**

```powershell
npm run build
```

Expected: Build exitoso.

- [ ] **Step 3: Commit**

```powershell
git add src/pages/CardDetail.tsx
git commit -m "feat: implement CardDetail page"
```

---

### Task 15: Decks Page

**Files:**
- Modify: `src/pages/Decks.tsx`

- [ ] **Step 1: Implementar src/pages/Decks.tsx**

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDeckStore } from '../store/deckStore';

export default function Decks() {
  const { decks, createDeck, deleteDeck, setActiveDeck, activeDeckId } = useDeckStore();
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim() || `Mazo ${decks.length + 1}`;
    createDeck(name);
    setNewName('');
    // Navegar al nuevo mazo creado
    setTimeout(() => {
      const { decks: updatedDecks } = useDeckStore.getState();
      if (updatedDecks.length > 0) {
        navigate(`/decks/${updatedDecks[updatedDecks.length - 1].id}`);
      }
    }, 50);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl brand-gradient">Mis Mazos</h1>
      </div>

      {/* Create deck form */}
      <form onSubmit={handleCreate} className="flex gap-3 mb-8">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre del nuevo mazo..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-surface border border-primary/20 text-text-main font-body text-sm placeholder-muted focus:outline-none focus:border-primary/60 transition-colors duration-200"
        />
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary2 text-white font-display text-sm tracking-wider transition-colors duration-200 cursor-pointer"
        >
          Crear
        </button>
      </form>

      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="font-body text-sm">No tienes mazos. ¡Crea uno arriba!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {decks.map((deck, i) => {
            const mainCount = deck.main.reduce((s, dc) => s + dc.count, 0);
            const isActive = deck.id === activeDeckId;

            return (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-lg border bg-surface p-4 flex flex-col gap-3 transition-colors duration-200 ${isActive ? 'border-primary/60' : 'border-primary/15 hover:border-primary/30'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-base text-text-main">{deck.name}</h3>
                    <p className="font-body text-xs text-muted mt-0.5">
                      {mainCount} cartas · {new Date(deck.updatedAt).toLocaleDateString('es')}
                    </p>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-body text-primary border border-primary/30 px-1.5 py-0.5 rounded">Activo</span>
                  )}
                </div>

                {/* Card preview thumbnails */}
                {deck.main.length > 0 && (
                  <div className="flex gap-1 overflow-hidden h-10">
                    {deck.main.slice(0, 8).map(({ card }) => (
                      <img
                        key={card.id}
                        src={card.card_images[0]?.image_url_small}
                        alt={card.name}
                        className="h-full w-auto rounded object-cover"
                      />
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-auto">
                  <Link
                    to={`/decks/${deck.id}`}
                    className="flex-1 text-center py-1.5 text-xs font-body rounded border border-primary/30 hover:border-primary text-text-secondary hover:text-text-main transition-colors duration-200"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => setActiveDeck(isActive ? null : deck.id)}
                    className={`flex-1 py-1.5 text-xs font-body rounded transition-colors duration-200 cursor-pointer ${isActive ? 'bg-primary/20 text-primary border border-primary/30' : 'border border-primary/15 text-muted hover:text-text-main hover:border-primary/30'}`}
                  >
                    {isActive ? 'Activo' : 'Activar'}
                  </button>
                  <button
                    onClick={() => { if (confirm(`¿Eliminar "${deck.name}"?`)) deleteDeck(deck.id); }}
                    className="px-2 py-1.5 text-xs font-body rounded border border-red-500/20 text-red-400 hover:border-red-500/50 transition-colors duration-200 cursor-pointer"
                    aria-label="Eliminar mazo"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

```powershell
npm run build
```

Expected: Build exitoso.

- [ ] **Step 3: Commit**

```powershell
git add src/pages/Decks.tsx
git commit -m "feat: implement Decks gallery page"
```

---

### Task 16: DeckBuilder Page + vercel.json

**Files:**
- Modify: `src/pages/DeckBuilder.tsx`
- Create: `vercel.json`

- [ ] **Step 1: Implementar src/pages/DeckBuilder.tsx**

```tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeckStore } from '../store/deckStore';
import { useDeckBuilder } from '../hooks/useDeckBuilder';
import { useCardSearch } from '../hooks/useCardSearch';
import { exportToYdk, getYdkFilename } from '../utils/ydkExporter';
import { validateDeck } from '../utils/deckValidator';
import CardGrid from '../components/cards/CardGrid';
import DeckZone from '../components/deck/DeckZone';
import DeckStats from '../components/deck/DeckStats';
import { MAX_MAIN, MAX_EXTRA, MAX_SIDE } from '../constants/deckRules';
import type { CardFilters, YGOCard } from '../types/ygo';

export default function DeckBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { decks, renameDeck } = useDeckStore();
  const { deck, tryAddCard, tryRemoveCard } = useDeckBuilder(id ?? '');

  const [filters, setFilters] = useState<CardFilters>({ fname: '' });
  const [activeTab, setActiveTab] = useState<'search' | 'deck'>('search');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useCardSearch(filters);
  const cards = data?.pages.flat() ?? [];

  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted">
        <p className="font-body text-sm">Mazo no encontrado</p>
        <button onClick={() => navigate('/decks')} className="text-xs text-primary hover:underline cursor-pointer">
          ← Ver mazos
        </button>
      </div>
    );
  }

  const validation = validateDeck(deck.main, deck.extra, deck.side);

  function handleAdd(card: YGOCard) {
    tryAddCard(card);
  }

  function handleExport() {
    const ydk = exportToYdk(deck);
    const blob = new Blob([ydk], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getYdkFilename(deck.name);
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleRename() {
    if (nameInput.trim() && id) {
      renameDeck(id, nameInput.trim());
      setEditingName(false);
    }
  }

  const mainCount = deck.main.reduce((s, dc) => s + dc.count, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/decks')} className="text-muted hover:text-primary text-sm font-body cursor-pointer transition-colors">← Mazos</button>
          {editingName ? (
            <form onSubmit={(e) => { e.preventDefault(); handleRename(); }} className="flex gap-2">
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="font-display text-lg bg-surface border border-primary/30 rounded px-2 py-0.5 text-text-main focus:outline-none"
              />
              <button type="submit" className="text-xs text-primary cursor-pointer">✓</button>
              <button type="button" onClick={() => setEditingName(false)} className="text-xs text-muted cursor-pointer">✕</button>
            </form>
          ) : (
            <button
              onClick={() => { setNameInput(deck.name); setEditingName(true); }}
              className="font-display text-lg text-text-main hover:text-primary transition-colors cursor-pointer"
            >
              {deck.name} ✎
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!validation.valid && (
            <span className="text-xs font-body text-red-400">{validation.errors[0]}</span>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 text-xs font-body rounded border border-primary/30 hover:border-primary text-text-secondary hover:text-text-main transition-colors duration-200 cursor-pointer"
          >
            Exportar .ydk
          </button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="flex md:hidden mb-4 rounded-lg overflow-hidden border border-primary/20">
        {(['search', 'deck'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-body transition-colors cursor-pointer ${activeTab === tab ? 'bg-primary/20 text-primary' : 'text-muted hover:text-text-main'}`}
          >
            {tab === 'search' ? 'Buscar cartas' : `Mi Mazo (${mainCount}/40)`}
          </button>
        ))}
      </div>

      {/* Desktop split / Mobile tab view */}
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-6">
        {/* Left — Card search */}
        <div className={`${activeTab !== 'search' ? 'hidden md:block' : ''}`}>
          <input
            type="text"
            value={filters.fname ?? ''}
            onChange={(e) => setFilters(prev => ({ ...prev, fname: e.target.value }))}
            placeholder="Buscar carta para agregar..."
            className="w-full px-4 py-2.5 mb-4 rounded-lg bg-surface border border-primary/20 text-text-main font-body text-sm placeholder-muted focus:outline-none focus:border-primary/60 transition-colors duration-200"
          />
          <CardGrid cards={cards} loading={isLoading} onAdd={handleAdd} />
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full mt-4 py-2 text-xs font-body text-muted border border-primary/15 rounded hover:text-text-main hover:border-primary/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
            </button>
          )}
        </div>

        {/* Right — Deck zones */}
        <div className={`space-y-4 ${activeTab !== 'deck' ? 'hidden md:block' : ''}`}>
          <DeckZone zone="main" cards={deck.main} max={MAX_MAIN} onRemove={(cardId, zone) => tryRemoveCard(cardId, zone)} />
          <DeckZone zone="extra" cards={deck.extra} max={MAX_EXTRA} onRemove={(cardId, zone) => tryRemoveCard(cardId, zone)} />
          <DeckZone zone="side" cards={deck.side} max={MAX_SIDE} onRemove={(cardId, zone) => tryRemoveCard(cardId, zone)} />
          <DeckStats main={deck.main} extra={deck.extra} side={deck.side} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Crear vercel.json**

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 3: Verificar build final completo**

```powershell
npm run build
npx vitest run
```

Expected: Build exitoso, todos los tests pasan.

- [ ] **Step 4: Commit final**

```powershell
git add src/pages/DeckBuilder.tsx vercel.json
git commit -m "feat: implement DeckBuilder page and SPA rewrite config"
```

---

## Self-Review

### Spec Coverage Check

| Spec requirement | Task que lo implementa |
|---|---|
| Búsqueda fuzzy por nombre | Task 13 (Cards page, filtro `fname`) |
| Filtros básicos tipo | Task 13 (BASIC_FILTER_CATEGORIES) |
| Filtros avanzados colapsables | Task 13 (showAdvanced panel) |
| Badge banlist en cards | Task 8 (BanBadge) |
| Paginación 20 en 20 | Task 6 (useCardSearch + useInfiniteQuery) |
| Grid `grid-cols-2 sm:3 md:4 lg:5` | Task 9 (CardGrid) |
| Imagen HD + fallback cropped | Task 10 (CardDetail component) |
| Stats ATK/DEF con color atributo | Task 10 |
| Precio USD por carta | Task 10 |
| Botón "Agregar al mazo activo" | Task 10 |
| Degradé reactivo por atributo | Task 10 (radial-gradient) |
| Main/Extra/Side deck con validación | Task 11 (DeckZone) |
| Máx 3 copias / limitadas | Task 3 (canAddCard) |
| Barra de progreso por zona | Task 11 (DeckZone) |
| Panel Análisis colapsable | Task 11 (DeckStats) |
| Curva de niveles | Task 11 (LevelCurve) |
| Precio total mazo | Task 11 (DeckStats, calcTotalDeckPrice) |
| Exportar .ydk | Task 3 (ydkExporter) + Task 16 (handleExport) |
| Múltiples mazos localStorage | Task 5 (deckStore + persist) |
| Chip flotante N/40 | Task 7 (ChipDeck) |
| Light/Dark mode | Task 7 (ThemeToggle + themeStore) |
| `createBrowserRouter` | Task 7 (router.tsx) |
| `vercel.json` SPA rewrite | Task 16 |
| Russo One + Chakra Petch fonts | Task 1 (index.css + tailwind.config) |

### No Placeholders ✓
Todos los pasos contienen código completo y comandos exactos.

### Type Consistency ✓
- `YGOCard`, `DeckCard`, `Deck`, `DeckZoneType`, `CardFilters`, `BanFormat` definidos en Task 2 y usados consistentemente.
- `canAddCard`, `isExtraDeckCard`, `validateDeck` definidos en Task 3, usados en Tasks 5, 6, 10, 16.
- `calcTotalDeckPrice` definida en Task 3, usada en Task 11.
- `exportToYdk`, `getYdkFilename` definidas en Task 3, usadas en Task 16.

